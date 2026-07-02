import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apaga mensagens recentes do canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Quantidade de mensagens, de 1 a 100.')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount', true);
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `${deleted.size} mensagens apagadas.`, ephemeral: true });
  }
};
