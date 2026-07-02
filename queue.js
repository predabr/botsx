import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('queue').setDescription('Mostra a fila de musicas.'),

  async execute(interaction) {
    const state = musicManager.getQueue(interaction.guildId);

    if (!state.current && state.queue.length === 0) {
      await interaction.reply('A fila esta vazia.');
      return;
    }

    const next = state.queue
      .slice(0, 10)
      .map((track, index) => `**${index + 1}.** ${track.title}`)
      .join('\n');

    await interaction.reply(
      [
        state.current ? `Tocando: **${state.current.title}**` : 'Nada tocando agora.',
        `Volume: ${state.volume}%`,
        `Repeat: ${state.repeatMode}`,
        next ? `Proximas:\n${next}` : 'Sem proximas musicas.'
      ].join('\n')
    );
  }
};
