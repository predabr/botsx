import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config.js';
import { chatCompletion, listProviderChoices } from '../../lib/aiProviders.js';
import { sendChunkedInteraction } from '../../lib/messages.js';

export default {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Resume um texto usando IA.')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Texto para resumir.')
        .setRequired(true)
        .setMaxLength(3500)
    )
    .addStringOption((option) =>
      option
        .setName('provider')
        .setDescription('Qual provedor de IA usar.')
        .setRequired(false)
        .addChoices(...listProviderChoices())
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    const providerId = interaction.options.getString('provider') || config.ai.defaultProvider;

    await interaction.deferReply({ ephemeral: true });

    const result = await chatCompletion(providerId, [
      { role: 'system', content: 'Resuma o texto em pontos claros, em portugues simples.' },
      { role: 'user', content: text }
    ]);

    await sendChunkedInteraction(interaction, `**Resumo (${result.provider.name})**\n${result.content}`, {
      ephemeral: true
    });
  }
};
