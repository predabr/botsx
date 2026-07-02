import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config.js';
import { listProviderChoices } from '../../lib/aiProviders.js';
import { runAiInteraction } from '../../lib/aiInteraction.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Converse com uma IA no Discord.')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('O que voce quer perguntar ou pedir para a IA.')
        .setRequired(true)
        .setMaxLength(1800)
    )
    .addStringOption((option) =>
      option
        .setName('provider')
        .setDescription('Qual provedor de IA usar.')
        .setRequired(false)
        .addChoices(...listProviderChoices())
    )
    .addBooleanOption((option) =>
      option
        .setName('private')
        .setDescription('Responder so para voce.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString('prompt', true);
    const providerId = interaction.options.getString('provider') || config.ai.defaultProvider;

    await runAiInteraction(interaction, prompt, providerId, {
      ephemeral: interaction.options.getBoolean('private') || false
    });
  }
};
