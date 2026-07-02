import { readJson, updateJson } from './jsonStore.js';

const fileName = 'ai-memory.json';
const maxItems = 50;

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export async function addMemory(userId, text) {
  const content = cleanText(text);
  if (!content) throw new Error('A memoria nao pode ficar vazia.');

  return updateJson(fileName, {}, (data) => {
    data[userId] ??= [];
    data[userId].push({
      id: Date.now().toString(36),
      text: content,
      createdAt: new Date().toISOString()
    });
    data[userId] = data[userId].slice(-maxItems);
    return data[userId];
  });
}

export async function getMemories(userId) {
  const data = await readJson(fileName, {});
  return data[userId] ?? [];
}

export async function clearMemories(userId) {
  await updateJson(fileName, {}, (data) => {
    delete data[userId];
  });
}

export function formatMemoriesForPrompt(memories) {
  if (memories.length === 0) return '';
  return [
    'Memoria persistente sobre este usuario. Use somente quando for util:',
    ...memories.map((memory, index) => `${index + 1}. ${memory.text}`)
  ].join('\n');
}
