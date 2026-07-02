import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma musica no canal de voz.')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('Nome, link do YouTube ou link direto de audio.')
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const result = await musicManager.enqueue(interaction, interaction.options.getString('song', true));
    const first = result.added[0];
    const extra = result.added.length > 1 ? ` + ${result.added.length - 1} da playlist` : '';

    await interaction.editReply(
      `Adicionado: **${first.title}**${extra}. Na fila agora: ${result.queueLength}.`
    );
  }
};
