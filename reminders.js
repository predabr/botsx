import { SlashCommandBuilder } from 'discord.js';
import { listReminders } from '../../lib/reminderStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reminders')
    .setDescription('Lista seus lembretes ativos.'),

  async execute(interaction) {
    const reminders = await listReminders(interaction.user.id);

    if (reminders.length === 0) {
      await interaction.reply({ content: 'Voce nao tem lembretes ativos.', ephemeral: true });
      return;
    }

    const lines = reminders.slice(0, 10).map((reminder) => {
      const timestamp = Math.floor(new Date(reminder.dueAt).getTime() / 1000);
      return `\`${reminder.id}\` - <t:${timestamp}:R> - ${reminder.text}`;
    });

    await interaction.reply({ content: lines.join('\n'), ephemeral: true });
  }
};
