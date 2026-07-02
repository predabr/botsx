import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config.js';
import { chatCompletion, listProviderChoices } from '../../lib/aiProviders.js';
import { addMemory } from '../../lib/memoryStore.js';
import { sendChunkedInteraction } from '../../lib/messages.js';
import { researchWiki } from '../../lib/wikiClient.js';

const languages = [
  { name: 'Portugues', value: 'pt' },
  { name: 'Ingles', value: 'en' },
  { name: 'Espanhol', value: 'es' }
];

function buildResearchPrompt(question, pages) {
  const sources = pages
    .map((page, index) => `[${index + 1}] ${page.title}\n${page.extract}\nURL: ${page.url}`)
    .join('\n\n');

  return [
    'Responda em portugues claro.',
    'Use somente as fontes abaixo. Se as fontes nao bastarem, diga isso.',
    'Cite as fontes no formato [1], [2] dentro da resposta.',
    '',
    `Pergunta: ${question}`,
    '',
    'Fontes:',
    sources
  ].join('\n');
}

export default {
  data: new SlashCommandBuilder()
    .setName('research')
    .setDescription('A IA pesquisa na Wikipedia e responde com fontes.')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('Pergunta para pesquisar.')
        .setRequired(true)
        .setMaxLength(500)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Idioma da pesquisa.')
        .setRequired(false)
        .addChoices(...languages)
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
        .setDescription('Salvar um resumo dessa pesquisa na memoria da IA.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const question = interaction.options.getString('question', true);
    const language = interaction.options.getString('language') || 'pt';
    const provider = interaction.options.getString('provider') || config.ai.defaultProvider;
    const save = interaction.options.getBoolean('save') || false;
    const pages = await researchWiki(question, { language, limit: 4 });

    if (pages.length === 0) {
      await interaction.editReply('Nao encontrei fontes na Wikipedia para essa pesquisa.');
      return;
    }

    const result = await chatCompletion(provider, [
      {
        role: 'system',
        content:
          'Voce e uma IA de pesquisa para Discord. Seja direto, avise limites das fontes e sempre cite links numerados.'
      },
      { role: 'user', content: buildResearchPrompt(question, pages) }
    ]);

    const sources = pages.map((page, index) => `[${index + 1}] ${page.title}: ${page.url}`).join('\n');
    const answer = `**Pesquisa:** ${question}\n\n${result.content}\n\n**Fontes**\n${sources}`;

    if (save) {
      await addMemory(interaction.user.id, `Pesquisa salva sobre "${question}": ${result.content.slice(0, 380)}`);
    }

    await sendChunkedInteraction(interaction, answer);
  }
};
