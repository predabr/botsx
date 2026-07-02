import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa um usuario do servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario expulso.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Motivo da expulsao.').setRequired(false).setMaxLength(300)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || `Kick aplicado por ${interaction.user.tag}`;
    const member = await interaction.guild.members.fetch(user.id);

    await member.kick(reason);
    await interaction.reply({ content: `${user.tag} foi expulso.`, ephemeral: true });
  }
};
