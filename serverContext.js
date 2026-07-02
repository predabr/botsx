import { config } from '../config.js';
import { getGuildSettings } from './guildSettingsStore.js';

function cleanText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

async function getRulesChannelContext(interaction, settings) {
  if (!settings.aiRulesChannelId || !interaction.guild) return '';

  const channel = await interaction.guild.channels.fetch(settings.aiRulesChannelId).catch(() => null);
  if (!channel?.isTextBased()) return '';

  const messages = await channel.messages
    .fetch({ limit: config.ai.rulesContextMessages })
    .catch(() => null);
  if (!messages) return '';

  const lines = [...messages.values()]
    .reverse()
    .filter((message) => !message.author.bot && cleanText(message.content))
    .map((message) => `- ${cleanText(message.content).slice(0, 350)}`)
    .slice(-config.ai.rulesContextMessages);

  if (lines.length === 0) return '';

  return ['Contexto do canal configurado como regras/wiki do servidor:', ...lines].join('\n');
}

export async function buildServerContext(interaction) {
  if (!interaction.guildId) return { settings: null, prompt: '' };

  const settings = await getGuildSettings(interaction.guildId);
  const blocks = [];

  if (settings.aiPersona) {
    blocks.push(`Persona configurada para a IA neste servidor:\n${settings.aiPersona}`);
  }

  if (settings.serverKnowledge.length > 0) {
    blocks.push(
      [
        'Memoria/conhecimento persistente deste servidor:',
        ...settings.serverKnowledge.map((entry, index) => `${index + 1}. ${entry.text}`)
      ].join('\n')
    );
  }

  const rulesContext = await getRulesChannelContext(interaction, settings);
  if (rulesContext) blocks.push(rulesContext);

  return {
    settings,
    prompt: blocks.join('\n\n')
  };
}

export function formatChannel(channelId) {
  return channelId ? `<#${channelId}>` : 'desligado';
}

export function formatRole(roleId) {
  return roleId ? `<@&${roleId}>` : 'desligado';
}
