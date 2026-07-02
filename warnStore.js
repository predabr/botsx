import { readJson, updateJson } from './jsonStore.js';

const fileName = 'warnings.json';

export async function addWarning(guildId, userId, warning) {
  return updateJson(fileName, {}, (data) => {
    data[guildId] ??= {};
    data[guildId][userId] ??= [];
    data[guildId][userId].push(warning);
    return data[guildId][userId];
  });
}

export async function getWarnings(guildId, userId) {
  const data = await readJson(fileName, {});
  return data[guildId]?.[userId] ?? [];
}
