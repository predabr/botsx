import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { addWarning } from '../../lib/warnStore.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Registra um aviso para um usuario.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario avisado.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Motivo do aviso.').setRequired(true).setMaxLength(500)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const warnings = await addWarning(interaction.guildId, user.id, {
      reason,
      moderatorId: interaction.user.id,
      createdAt: new Date().toISOString()
    });

    await interaction.reply({
      content: `${user.tag} avisado. Total de avisos: ${warnings.length}.`,
      ephemeral: true
    });
  }
};
