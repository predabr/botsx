import { SlashCommandBuilder } from 'discord.js';
import {
  addPlaylistTrack,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists
} from '../../lib/musicLibraryStore.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Cria e toca playlists pessoais.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Cria uma playlist.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da playlist.').setRequired(true).setMaxLength(40)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Adiciona musica na playlist.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da playlist.').setRequired(true).setMaxLength(40)
        )
        .addStringOption((option) =>
          option.setName('song').setDescription('Nome ou link da musica.').setRequired(true).setMaxLength(500)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lista suas playlists.'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('Toca uma playlist.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da playlist.').setRequired(true).setMaxLength(40)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Apaga uma playlist.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da playlist.').setRequired(true).setMaxLength(40)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const playlist = await createPlaylist(interaction.guildId, interaction.user.id, interaction.options.getString('name', true));
      await interaction.reply({ content: `Playlist criada: ${playlist.name}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'add') {
      const playlist = await addPlaylistTrack(
        interaction.guildId,
        interaction.user.id,
        interaction.options.getString('name', true),
        interaction.options.getString('song', true)
      );
      await interaction.reply({
        content: `Musica adicionada em ${playlist.name}. Total: ${playlist.tracks.length}.`,
        ephemeral: true
      });
      return;
    }

    if (subcommand === 'list') {
      const playlists = await listPlaylists(interaction.guildId, interaction.user.id);
      await interaction.reply({
        content:
          playlists.length === 0
            ? 'Voce nao tem playlists.'
            : playlists.map((playlist) => `**${playlist.name}** - ${playlist.tracks.length} musicas`).join('\n'),
        ephemeral: true
      });
      return;
    }

    if (subcommand === 'play') {
      await interaction.deferReply();
      const playlist = await getPlaylist(interaction.guildId, interaction.user.id, interaction.options.getString('name', true));
      if (!playlist || playlist.tracks.length === 0) {
        await interaction.editReply('Playlist vazia ou inexistente.');
        return;
      }

      let added = 0;
      for (const track of playlist.tracks.slice(0, 20)) {
        await musicManager.enqueue(interaction, track.query);
        added += 1;
      }

      await interaction.editReply(`Playlist **${playlist.name}** adicionada na fila: ${added} musicas.`);
      return;
    }

    if (subcommand === 'delete') {
      const ok = await deletePlaylist(interaction.guildId, interaction.user.id, interaction.options.getString('name', true));
      await interaction.reply({ content: ok ? 'Playlist apagada.' : 'Nao encontrei essa playlist.', ephemeral: true });
    }
  }
};
