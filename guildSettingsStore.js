import { readJson, updateJson } from './jsonStore.js';

const fileName = 'guild-settings.json';
const maxServerKnowledge = 40;

export const defaultGuildSettings = {
  logChannelId: null,
  welcomeChannelId: null,
  welcomeMessage: 'Bem-vindo {user} ao {server}!',
  autoRoleId: null,
  aiEnabled: true,
  aiChannelId: null,
  aiRulesChannelId: null,
  aiPersona: '',
  serverKnowledge: [],
  musicDefaultVolume: null
};

function mergeSettings(settings = {}) {
  return {
    ...defaultGuildSettings,
    ...settings,
    serverKnowledge: settings.serverKnowledge ?? []
  };
}

export async function getGuildSettings(guildId) {
  const data = await readJson(fileName, {});
  return mergeSettings(data[guildId]);
}

export async function updateGuildSettings(guildId, updater) {
  return updateJson(fileName, {}, (data) => {
    data[guildId] = mergeSettings(data[guildId]);
    const result = updater(data[guildId]);
    data[guildId].serverKnowledge = data[guildId].serverKnowledge.slice(-maxServerKnowledge);
    return result ?? data[guildId];
  });
}

export async function addServerKnowledge(guildId, text, source = 'manual') {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 1200);
  if (!clean) throw new Error('Conhecimento vazio.');

  return updateGuildSettings(guildId, (settings) => {
    settings.serverKnowledge.push({
      id: Date.now().toString(36),
      text: clean,
      source,
      createdAt: new Date().toISOString()
    });
    return settings.serverKnowledge;
  });
}

export async function clearServerKnowledge(guildId) {
  await updateGuildSettings(guildId, (settings) => {
    settings.serverKnowledge = [];
  });
}
