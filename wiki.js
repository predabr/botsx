import { SlashCommandBuilder } from 'discord.js';
import { sendChunkedInteraction } from '../../lib/messages.js';
import { researchWiki } from '../../lib/wikiClient.js';

const languages = [
  { name: 'Portugues', value: 'pt' },
  { name: 'Ingles', value: 'en' },
  { name: 'Espanhol', value: 'es' }
];

export default {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Pesquisa na Wikipedia e mostra fontes.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('O que pesquisar.')
        .setRequired(true)
        .setMaxLength(300)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Idioma da Wikipedia.')
        .setRequired(false)
        .addChoices(...languages)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const language = interaction.options.getString('language') || 'pt';
    const pages = await researchWiki(query, { language, limit: 3 });

    if (pages.length === 0) {
      await interaction.editReply('Nao encontrei nada na Wikipedia para essa busca.');
      return;
    }

    const text = pages
      .map((page, index) => {
        const extract = page.extract.length > 700 ? `${page.extract.slice(0, 700)}...` : page.extract;
        return `**${index + 1}. ${page.title}**\n${extract}\n${page.url}`;
      })
      .join('\n\n');

    await sendChunkedInteraction(interaction, text);
  }
};
