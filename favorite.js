import { SlashCommandBuilder } from 'discord.js';
import {
  addFavorite,
  getFavorite,
  listFavorites,
  removeFavorite
} from '../../lib/musicLibraryStore.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('favorite')
    .setDescription('Salva e toca musicas favoritas.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Salva uma musica favorita.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome curto.').setRequired(true).setMaxLength(40)
        )
        .addStringOption((option) =>
          option.setName('song').setDescription('Nome ou link da musica.').setRequired(true).setMaxLength(500)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Lista suas favoritas.'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('Toca uma favorita.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da favorita.').setRequired(true).setMaxLength(40)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove uma favorita.')
        .addStringOption((option) =>
          option.setName('name').setDescription('Nome da favorita.').setRequired(true).setMaxLength(40)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const favorite = await addFavorite(
        interaction.guildId,
        interaction.user.id,
        interaction.options.getString('name', true),
        interaction.options.getString('song', true)
      );
      await interaction.reply({ content: `Favorita salva: ${favorite.name}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'list') {
      const favorites = await listFavorites(interaction.guildId, interaction.user.id);
      await interaction.reply({
        content:
          favorites.length === 0
            ? 'Voce nao tem favoritas.'
            : favorites.map((favorite) => `**${favorite.name}** - ${favorite.query}`).join('\n'),
        ephemeral: true
      });
      return;
    }

    if (subcommand === 'play') {
      await interaction.deferReply();
      const favorite = await getFavorite(interaction.guildId, interaction.user.id, interaction.options.getString('name', true));
      if (!favorite) {
        await interaction.editReply('Nao encontrei essa favorita.');
        return;
      }
      const result = await musicManager.enqueue(interaction, favorite.query);
      await interaction.editReply(`Favorita adicionada: **${result.added[0].title}**.`);
      return;
    }

    if (subcommand === 'remove') {
      const ok = await removeFavorite(interaction.guildId, interaction.user.id, interaction.options.getString('name', true));
      await interaction.reply({ content: ok ? 'Favorita removida.' : 'Nao encontrei essa favorita.', ephemeral: true });
    }
  }
};
