import { config } from '../config.js';
import { buildFreeGameButtons } from './freeGameButtons.js';
import { fetchFreeGames, formatFreeGames } from './freeGames.js';
import { readJson, updateJson } from './jsonStore.js';
import { chunkText } from './messages.js';

const fileName = 'free-games-watchers.json';
let interval = null;

export async function getFreeGamesWatcher(guildId) {
  const data = await readJson(fileName, {});
  return data[guildId] ?? null;
}

export async function setFreeGamesWatcher(guildId, watcher) {
  await updateJson(fileName, {}, (data) => {
    data[guildId] = {
      channelId: watcher.channelId,
      platform: watcher.platform || 'all',
      pingEveryone: Boolean(watcher.pingEveryone),
      seenIds: watcher.seenIds ?? [],
      updatedAt: new Date().toISOString()
    };
  });
}

export async function removeFreeGamesWatcher(guildId) {
  await updateJson(fileName, {}, (data) => {
    delete data[guildId];
  });
}

async function checkOneWatcher(client, guildId, watcher) {
  const { games } = await fetchFreeGames({
    platform: watcher.platform,
    limit: config.freeGames.maxResults
  });

  const seen = new Set(watcher.seenIds ?? []);
  const fresh = games.filter((game) => !seen.has(game.id));
  const nextSeen = [...new Set([...games.map((game) => game.id), ...(watcher.seenIds ?? [])])].slice(0, 80);

  await updateJson(fileName, {}, (data) => {
    if (data[guildId]) data[guildId].seenIds = nextSeen;
  });

  if (fresh.length === 0) return;

  const channel = await client.channels.fetch(watcher.channelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  const mention = watcher.pingEveryone ? '@everyone\n' : '';
  const text = `${mention}${formatFreeGames(fresh, { header: 'Novos jogos gratis encontrados' })}`;
  const chunks = chunkText(text);
  for (const [index, chunk] of chunks.entries()) {
    await channel.send({
      content: chunk,
      components: index === 0 ? buildFreeGameButtons(fresh) : []
    });
  }
}

export async function checkFreeGamesWatchers(client) {
  const data = await readJson(fileName, {});
  const entries = Object.entries(data);

  for (const [guildId, watcher] of entries) {
    await checkOneWatcher(client, guildId, watcher).catch((error) => {
      console.error(`Free games watcher failed for ${guildId}`, error);
    });
  }
}

export function startFreeGamesWatcher(client) {
  if (interval) clearInterval(interval);

  const delay = Math.max(config.freeGames.checkMinutes, 15) * 60 * 1000;
  setTimeout(() => checkFreeGamesWatchers(client).catch((error) => console.error('Free games check failed', error)), 30_000);
  interval = setInterval(
    () => checkFreeGamesWatchers(client).catch((error) => console.error('Free games check failed', error)),
    delay
  );
}
