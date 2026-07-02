import { SlashCommandBuilder } from 'discord.js';
import { createReminder } from '../../lib/reminderStore.js';
import { formatDuration, parseDuration } from '../../lib/time.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Cria um lembrete.')
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription('Ex: 10m, 2h, 1d, 1h30m.')
        .setRequired(true)
        .setMaxLength(30)
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('O que devo lembrar.')
        .setRequired(true)
        .setMaxLength(800)
    ),

  async execute(interaction) {
    const duration = parseDuration(interaction.options.getString('time', true));
    if (!duration) {
      await interaction.reply({ content: 'Tempo invalido. Use algo como `10m`, `2h` ou `1d`.', ephemeral: true });
      return;
    }

    const dueAt = new Date(Date.now() + duration).toISOString();
    const reminder = await createReminder(interaction.client, {
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      dueAt,
      text: interaction.options.getString('text', true)
    });

    await interaction.reply({
      content: `Lembrete criado: \`${reminder.id}\` em ${formatDuration(duration)}.`,
      ephemeral: true
    });
  }
};
