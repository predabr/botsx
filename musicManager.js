import { Readable } from 'node:stream';
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel
} from '@discordjs/voice';
import { PermissionFlagsBits } from 'discord.js';
import ffmpegPath from 'ffmpeg-static';
import playdl from 'play-dl';
import { config } from '../config.js';
import { getGuildSettings } from './guildSettingsStore.js';

const states = new Map();

if (ffmpegPath) {
  process.env.FFMPEG_PATH = ffmpegPath;
}

function clampVolume(volume) {
  return Math.min(100, Math.max(0, volume));
}

function getState(guildId) {
  let state = states.get(guildId);
  if (state) return state;

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause
    }
  });

  state = {
    guildId,
    player,
    connection: null,
    queue: [],
    current: null,
    volume: clampVolume(config.music.defaultVolume) / 100,
    volumeInitialized: false,
    repeatMode: 'off',
    textChannelId: null
  };

  player.on(AudioPlayerStatus.Idle, () => {
    playNext(guildId).catch((error) => console.error('Music queue failed', error));
  });

  player.on('error', (error) => {
    console.error('Music player error', error);
    notify(state, `Erro na musica: ${error.message}`).catch(() => null);
    playNext(guildId).catch((nextError) => console.error('Music recovery failed', nextError));
  });

  states.set(guildId, state);
  return state;
}

async function notify(state, content) {
  if (!state.textChannelId || !state.client) return;

  const channel = await state.client.channels.fetch(state.textChannelId).catch(() => null);
  if (channel?.isTextBased()) await channel.send(content).catch(() => null);
}

function isDirectAudioUrl(query) {
  return /^https?:\/\//i.test(query) && !/(youtube\.com|youtu\.be|soundcloud\.com)/i.test(query);
}

function trackFromVideo(video, requestedBy) {
  return {
    title: video.title || 'Musica sem titulo',
    url: video.url,
    duration: video.durationRaw || video.durationInSec || 'ao vivo',
    requestedBy,
    type: 'play-dl'
  };
}

async function resolveTracks(query, requestedBy) {
  const cleanQuery = query.trim();
  if (!cleanQuery) throw new Error('Digite o nome ou link da musica.');

  if (isDirectAudioUrl(cleanQuery)) {
    return [
      {
        title: cleanQuery,
        url: cleanQuery,
        duration: 'stream',
        requestedBy,
        type: 'direct'
      }
    ];
  }

  const validation = playdl.yt_validate(cleanQuery);

  if (validation === 'playlist') {
    const playlist = await playdl.playlist_info(cleanQuery, { incomplete: true });
    const videos = await playlist.all_videos();
    return videos.slice(0, config.music.maxPlaylistItems).map((video) => trackFromVideo(video, requestedBy));
  }

  if (validation === 'video') {
    const info = await playdl.video_basic_info(cleanQuery);
    return [trackFromVideo(info.video_details, requestedBy)];
  }

  const results = await playdl.search(cleanQuery, { limit: 1 });
  if (results.length === 0) throw new Error('Nao encontrei essa musica.');

  return [trackFromVideo(results[0], requestedBy)];
}

async function createResource(track, volume) {
  let resource;

  if (track.type === 'direct') {
    const response = await fetch(track.url);
    if (!response.ok || !response.body) {
      throw new Error(`Nao consegui abrir o audio direto (${response.status}).`);
    }

    resource = createAudioResource(Readable.fromWeb(response.body), {
      inlineVolume: true,
      metadata: track
    });
  } else {
    const stream = await playdl.stream(track.url);
    resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
      metadata: track
    });
  }

  resource.volume?.setVolume(volume);
  return resource;
}

async function connect(interaction, state) {
  if (!interaction.guild) throw new Error('Musica so funciona dentro de servidor.');

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) throw new Error('Entre em um canal de voz primeiro.');

  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions?.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
    throw new Error('Preciso de permissao para entrar e falar nesse canal de voz.');
  }

  if (state.connection?.joinConfig.channelId === voiceChannel.id) return state.connection;

  state.connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
    selfDeaf: true
  });
  state.connection.subscribe(state.player);

  state.connection.on(VoiceConnectionStatus.Disconnected, () => {
    state.connection?.destroy();
    states.delete(interaction.guildId);
  });

  await entersState(state.connection, VoiceConnectionStatus.Ready, 20_000);
  return state.connection;
}

async function playNext(guildId) {
  const state = states.get(guildId);
  if (!state) return null;

  if (state.current && state.repeatMode === 'one') {
    const resource = await createResource(state.current, state.volume);
    state.player.play(resource);
    await notify(state, `Repetindo: **${state.current.title}**`);
    return state.current;
  }

  if (state.current && state.repeatMode === 'all') {
    state.queue.push(state.current);
  }

  const next = state.queue.shift();
  state.current = next ?? null;

  if (!next) return null;

  const resource = await createResource(next, state.volume);
  state.player.play(resource);
  await notify(state, `Tocando agora: **${next.title}**`);
  return next;
}

export const musicManager = {
  async enqueue(interaction, query) {
    const state = getState(interaction.guildId);
    state.client = interaction.client;
    state.textChannelId = interaction.channelId;

    if (!state.volumeInitialized) {
      const settings = await getGuildSettings(interaction.guildId);
      if (settings.musicDefaultVolume !== null) {
        state.volume = clampVolume(settings.musicDefaultVolume) / 100;
      }
      state.volumeInitialized = true;
    }

    await connect(interaction, state);

    const tracks = await resolveTracks(query, interaction.user.id);
    if (state.queue.length + tracks.length > config.music.maxQueue) {
      throw new Error(`A fila so aceita ate ${config.music.maxQueue} musicas.`);
    }

    state.queue.push(...tracks);

    if (state.player.state.status === AudioPlayerStatus.Idle && !state.current) {
      await playNext(interaction.guildId);
    }

    return {
      added: tracks,
      current: state.current,
      queueLength: state.queue.length
    };
  },

  skip(guildId) {
    const state = states.get(guildId);
    if (!state?.current) return false;
    state.player.stop(true);
    return true;
  },

  stop(guildId) {
    const state = states.get(guildId);
    if (!state) return false;
    state.queue = [];
    state.current = null;
    state.repeatMode = 'off';
    state.player.stop(true);
    return true;
  },

  pause(guildId) {
    const state = states.get(guildId);
    return Boolean(state?.player.pause());
  },

  resume(guildId) {
    const state = states.get(guildId);
    return Boolean(state?.player.unpause());
  },

  leave(guildId) {
    const state = states.get(guildId);
    if (!state) return false;
    state.queue = [];
    state.current = null;
    state.connection?.destroy();
    states.delete(guildId);
    return true;
  },

  setVolume(guildId, volume) {
    const state = states.get(guildId);
    if (!state) return null;
    state.volume = clampVolume(volume) / 100;
    const resource = state.player.state.resource;
    resource?.volume?.setVolume(state.volume);
    return Math.round(state.volume * 100);
  },

  setRepeat(guildId, mode) {
    const state = getState(guildId);
    state.repeatMode = ['off', 'one', 'all'].includes(mode) ? mode : 'off';
    return state.repeatMode;
  },

  shuffle(guildId) {
    const state = states.get(guildId);
    if (!state || state.queue.length < 2) return false;

    for (let index = state.queue.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [state.queue[index], state.queue[randomIndex]] = [state.queue[randomIndex], state.queue[index]];
    }

    return true;
  },

  getQueue(guildId) {
    const state = states.get(guildId);
    if (!state) return { current: null, queue: [], volume: config.music.defaultVolume, repeatMode: 'off' };
    return {
      current: state.current,
      queue: [...state.queue],
      volume: Math.round(state.volume * 100),
      repeatMode: state.repeatMode
    };
  }
};
