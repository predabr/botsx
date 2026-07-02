import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config.js';
import { chatCompletion, listProviderChoices } from '../../lib/aiProviders.js';
import { addMemory } from '../../lib/memoryStore.js';
import { sendChunkedInteraction } from '../../lib/messages.js';
import { searchWeb } from '../../lib/webSearchClient.js';

function buildPrompt(query, sources) {
  return [
    'Responda em portugues claro e direto.',
    'Use as fontes abaixo e cite no formato [1], [2].',
    'Se as fontes forem insuficientes, avise.',
    '',
    `Busca: ${query}`,
    '',
    sources
      .map((source, index) => `[${index + 1}] ${source.title} (${source.source})\n${source.snippet}\nURL: ${source.url}`)
      .join('\n\n')
  ].join('\n');
}

export default {
  data: new SlashCommandBuilder()
    .setName('websearch')
    .setDescription('Pesquisa na web/wiki e responde com IA e fontes.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('O que pesquisar.')
        .setRequired(true)
        .setMaxLength(500)
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
        .setName('save')
        .setDescription('Salvar resumo dessa busca na memoria da IA.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const provider = interaction.options.getString('provider') || config.ai.defaultProvider;
    const save = interaction.options.getBoolean('save') || false;
    const { sources, errors } = await searchWeb(query);

    if (sources.length === 0) {
      await interaction.editReply(`Nao encontrei fontes para essa busca. ${errors.join(' ')}`.trim());
      return;
    }

    const result = await chatCompletion(provider, [
      {
        role: 'system',
        content: 'Voce e uma IA de pesquisa. Priorize precisao, fontes e limites do que foi encontrado.'
      },
      { role: 'user', content: buildPrompt(query, sources) }
    ]);

    if (save) {
      await addMemory(interaction.user.id, `Busca salva sobre "${query}": ${result.content.slice(0, 380)}`);
    }

    const sourceList = sources.map((source, index) => `[${index + 1}] ${source.title}: ${source.url}`).join('\n');
    const warning = errors.length > 0 ? `\n\nAvisos de busca: ${errors.join(' | ')}` : '';

    await sendChunkedInteraction(interaction, `${result.content}\n\n**Fontes**\n${sourceList}${warning}`);
  }
};
