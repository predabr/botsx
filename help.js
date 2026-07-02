import { SlashCommandBuilder } from 'discord.js';
import { sendChunkedInteraction } from '../../lib/messages.js';

const categoryNames = {
  ai: 'IA',
  fun: 'Diversao',
  games: 'Jogos gratis',
  leveling: 'XP e Rank',
  moderation: 'Moderacao',
  music: 'Musica',
  reminders: 'Lembretes',
  research: 'Pesquisa',
  utility: 'Utilidades'
};

function formatCommands(commands) {
  const groups = new Map();

  for (const command of commands.values()) {
    const data = command.data.toJSON();
    const category = command.category || 'utility';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(`/${data.name} - ${data.description}`);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, entries]) => {
      const label = categoryNames[category] || category;
      return `**${label}**\n${entries.sort().join('\n')}`;
    })
    .join('\n\n');
}

export async function sendCommandList(interaction) {
  await sendChunkedInteraction(interaction, formatCommands(interaction.client.commands), {
    ephemeral: true
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra todos os comandos do bot.'),

  async execute(interaction) {
    await sendCommandList(interaction);
  }
};
