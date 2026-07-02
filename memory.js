import { SlashCommandBuilder } from 'discord.js';
import { getMemories } from '../../lib/memoryStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('memory')
    .setDescription('Mostra o que a IA lembra sobre voce.'),

  async execute(interaction) {
    const memories = await getMemories(interaction.user.id);

    if (memories.length === 0) {
      await interaction.reply({ content: 'Ainda nao tenho memorias salvas sobre voce.', ephemeral: true });
      return;
    }

    const lines = memories.map((memory, index) => `**${index + 1}.** ${memory.text}`);
    await interaction.reply({ content: lines.join('\n'), ephemeral: true });
  }
};
