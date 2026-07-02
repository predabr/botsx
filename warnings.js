import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getWarnings } from '../../lib/warnStore.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Mostra os avisos de um usuario.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario consultado.').setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const warnings = await getWarnings(interaction.guildId, user.id);

    if (warnings.length === 0) {
      await interaction.reply({ content: `${user.tag} nao tem avisos.`, ephemeral: true });
      return;
    }

    const lines = warnings.map((warning, index) => {
      const timestamp = Math.floor(new Date(warning.createdAt).getTime() / 1000);
      return `**${index + 1}.** <t:${timestamp}:R> por <@${warning.moderatorId}>: ${warning.reason}`;
    });

    await interaction.reply({
      content: [`Avisos de **${user.tag}**:`, ...lines].join('\n'),
      ephemeral: true
    });
  }
};
