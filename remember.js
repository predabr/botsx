import { SlashCommandBuilder } from 'discord.js';
import { addMemory } from '../../lib/memoryStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remember')
    .setDescription('Salva uma memoria para a IA lembrar sobre voce.')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('O que a IA deve lembrar.')
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    const memories = await addMemory(interaction.user.id, interaction.options.getString('text', true));
    await interaction.reply({
      content: `Memoria salva. Agora tenho ${memories.length} memorias suas.`,
      ephemeral: true
    });
  }
};
