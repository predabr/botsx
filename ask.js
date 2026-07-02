import { SlashCommandBuilder } from 'discord.js';
import { runAiInteraction } from '../../lib/aiInteraction.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Pergunta rapido para a IA.')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Sua pergunta.')
        .setRequired(true)
        .setMaxLength(1800)
    )
    .addBooleanOption((option) =>
      option
        .setName('private')
        .setDescription('Responder so para voce.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await runAiInteraction(interaction, interaction.options.getString('prompt', true), undefined, {
      ephemeral: interaction.options.getBoolean('private') || false
    });
  }
};
