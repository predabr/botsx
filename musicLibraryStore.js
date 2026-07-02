import { readJson, updateJson } from './jsonStore.js';

const fileName = 'music-library.json';

function cleanName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40);
}

function userKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

export async function addFavorite(guildId, userId, name, query) {
  const key = userKey(guildId, userId);
  const id = cleanName(name);
  if (!id) throw new Error('Nome invalido.');

  return updateJson(fileName, { favorites: {}, playlists: {} }, (data) => {
    data.favorites ??= {};
    data.favorites[key] ??= {};
    data.favorites[key][id] = {
      name: id,
      query,
      createdAt: new Date().toISOString()
    };
    return data.favorites[key][id];
  });
}

export async function listFavorites(guildId, userId) {
  const data = await readJson(fileName, { favorites: {}, playlists: {} });
  return Object.values(data.favorites?.[userKey(guildId, userId)] ?? {});
}

export async function getFavorite(guildId, userId, name) {
  const data = await readJson(fileName, { favorites: {}, playlists: {} });
  return data.favorites?.[userKey(guildId, userId)]?.[cleanName(name)] ?? null;
}

export async function removeFavorite(guildId, userId, name) {
  const key = userKey(guildId, userId);
  const id = cleanName(name);

  return updateJson(fileName, { favorites: {}, playlists: {} }, (data) => {
    const exists = Boolean(data.favorites?.[key]?.[id]);
    if (exists) delete data.favorites[key][id];
    return exists;
  });
}

export async function createPlaylist(guildId, userId, name) {
  const key = userKey(guildId, userId);
  const id = cleanName(name);
  if (!id) throw new Error('Nome invalido.');

  return updateJson(fileName, { favorites: {}, playlists: {} }, (data) => {
    data.playlists ??= {};
    data.playlists[key] ??= {};
    data.playlists[key][id] ??= {
      name: id,
      tracks: [],
      createdAt: new Date().toISOString()
    };
    return data.playlists[key][id];
  });
}

export async function addPlaylistTrack(guildId, userId, name, query) {
  const key = userKey(guildId, userId);
  const id = cleanName(name);

  return updateJson(fileName, { favorites: {}, playlists: {} }, (data) => {
    data.playlists ??= {};
    data.playlists[key] ??= {};
    data.playlists[key][id] ??= {
      name: id,
      tracks: [],
      createdAt: new Date().toISOString()
    };
    data.playlists[key][id].tracks.push({
      query,
      createdAt: new Date().toISOString()
    });
    return data.playlists[key][id];
  });
}

export async function listPlaylists(guildId, userId) {
  const data = await readJson(fileName, { favorites: {}, playlists: {} });
  return Object.values(data.playlists?.[userKey(guildId, userId)] ?? {});
}

export async function getPlaylist(guildId, userId, name) {
  const data = await readJson(fileName, { favorites: {}, playlists: {} });
  return data.playlists?.[userKey(guildId, userId)]?.[cleanName(name)] ?? null;
}

export async function deletePlaylist(guildId, userId, name) {
  const key = userKey(guildId, userId);
  const id = cleanName(name);

  return updateJson(fileName, { favorites: {}, playlists: {} }, (data) => {
    const exists = Boolean(data.playlists?.[key]?.[id]);
    if (exists) delete data.playlists[key][id];
    return exists;
  });
}
