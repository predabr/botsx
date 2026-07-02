import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faz o bot enviar uma mensagem.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option.setName('text').setDescription('Mensagem para enviar.').setRequired(true).setMaxLength(1800)
    ),

  async execute(interaction) {
    await interaction.channel.send(interaction.options.getString('text', true));
    await interaction.reply({ content: 'Mensagem enviada.', ephemeral: true });
  }
};
