import { config } from '../config.js';
import { readJson, updateJson } from './jsonStore.js';

const fileName = 'xp.json';
const cooldowns = new Map();

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

export function xpForNextLevel(level) {
  return (level + 1) ** 2 * 100;
}

export async function addXpFromMessage(message) {
  if (!config.xp.enabled) return null;

  const key = `${message.guildId}:${message.author.id}`;
  const now = Date.now();
  const last = cooldowns.get(key) ?? 0;
  if (now - last < config.xp.cooldownSeconds * 1000) return null;

  cooldowns.set(key, now);

  const amount =
    Math.floor(Math.random() * (Math.max(config.xp.max, config.xp.min) - config.xp.min + 1)) +
    config.xp.min;

  return updateJson(fileName, {}, (data) => {
    data[message.guildId] ??= {};
    data[message.guildId][message.author.id] ??= { xp: 0, messages: 0 };

    const record = data[message.guildId][message.author.id];
    const oldLevel = levelFromXp(record.xp);
    record.xp += amount;
    record.messages += 1;
    record.updatedAt = new Date().toISOString();

    const newLevel = levelFromXp(record.xp);
    return {
      amount,
      record,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel
    };
  });
}

export async function getRank(guildId, userId) {
  const data = await readJson(fileName, {});
  const guildData = data[guildId] ?? {};
  const record = guildData[userId] ?? { xp: 0, messages: 0 };
  const sorted = Object.entries(guildData).sort((a, b) => b[1].xp - a[1].xp);
  const index = sorted.findIndex(([id]) => id === userId);

  return {
    rank: index === -1 ? sorted.length + 1 : index + 1,
    xp: record.xp,
    messages: record.messages,
    level: levelFromXp(record.xp),
    nextLevelXp: xpForNextLevel(levelFromXp(record.xp))
  };
}

export async function getLeaderboard(guildId, limit = 10) {
  const data = await readJson(fileName, {});
  return Object.entries(data[guildId] ?? {})
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, limit)
    .map(([userId, record], index) => ({
      position: index + 1,
      userId,
      xp: record.xp,
      level: levelFromXp(record.xp),
      messages: record.messages
    }));
}
