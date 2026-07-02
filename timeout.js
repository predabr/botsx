import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Coloca um usuario de castigo por alguns minutos.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario que recebera timeout.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('minutes')
        .setDescription('Duracao em minutos.')
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Motivo do timeout.').setRequired(false).setMaxLength(300)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('reason') || `Timeout aplicado por ${interaction.user.tag}`;
    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ content: `${user.tag} recebeu timeout por ${minutes} minutos.`, ephemeral: true });
  }
};
