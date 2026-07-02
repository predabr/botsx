import { SlashCommandBuilder } from 'discord.js';
import { clearMemories } from '../../lib/memoryStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('forgetmemory')
    .setDescription('Apaga todas as suas memorias salvas na IA.'),

  async execute(interaction) {
    await clearMemories(interaction.user.id);
    await interaction.reply({ content: 'Memorias apagadas.', ephemeral: true });
  }
};
