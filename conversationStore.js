import { readJson, updateJson } from './jsonStore.js';

const fileName = 'conversations.json';

export function conversationKey(interaction) {
  return [interaction.guildId ?? 'dm', interaction.channelId, interaction.user.id].join(':');
}

export async function getConversation(key) {
  const conversations = await readJson(fileName, {});
  return conversations[key] ?? [];
}

export async function saveConversation(key, messages, maxHistory) {
  await updateJson(fileName, {}, (conversations) => {
    conversations[key] = messages.slice(-maxHistory);
  });
}

export async function resetConversation(key) {
  await updateJson(fileName, {}, (conversations) => {
    delete conversations[key];
  });
}
