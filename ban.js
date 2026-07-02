import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um usuario do servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario banido.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Motivo do banimento.').setRequired(false).setMaxLength(300)
    )
    .addIntegerOption((option) =>
      option
        .setName('delete_days')
        .setDescription('Dias de mensagens para apagar, de 0 a 7.')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || `Ban aplicado por ${interaction.user.tag}`;
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    await interaction.guild.members.ban(user.id, {
      reason,
      deleteMessageSeconds: deleteDays * 24 * 60 * 60
    });

    await interaction.reply({ content: `${user.tag} foi banido.`, ephemeral: true });
  }
};
