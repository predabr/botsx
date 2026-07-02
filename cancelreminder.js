import { SlashCommandBuilder } from 'discord.js';
import { cancelReminder } from '../../lib/reminderStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cancelreminder')
    .setDescription('Cancela um lembrete.')
    .addStringOption((option) =>
      option.setName('id').setDescription('ID mostrado em /reminders.').setRequired(true)
    ),

  async execute(interaction) {
    const ok = await cancelReminder(interaction.user.id, interaction.options.getString('id', true));
    await interaction.reply({
      content: ok ? 'Lembrete cancelado.' : 'Nao encontrei esse lembrete seu.',
      ephemeral: true
    });
  }
};
