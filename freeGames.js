import { config } from '../config.js';

const gamerPowerUrl = 'https://www.gamerpower.com/api/giveaways?type=game&sort-by=date';
const epicUrl =
  'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pt-BR&country=BR&allowCountries=BR';

const platformMatchers = {
  all: [],
  pc: ['pc', 'windows'],
  steam: ['steam'],
  epic: ['epic'],
  gog: ['gog'],
  itch: ['itch'],
  xbox: ['xbox'],
  playstation: ['playstation', 'ps4', 'ps5'],
  switch: ['switch'],
  android: ['android'],
  ios: ['ios']
};

function normalizePlatform(platform = 'all') {
  return platformMatchers[platform] ? platform : 'all';
}

function normalizeText(text = '') {
  return text.toLowerCase();
}

function matchesPlatform(game, platform) {
  const normalizedPlatform = normalizePlatform(platform);
  const matchers = platformMatchers[normalizedPlatform];
  if (matchers.length === 0) return true;

  const haystack = normalizeText([game.platforms, game.platform, game.source].filter(Boolean).join(' '));
  return matchers.some((matcher) => haystack.includes(matcher));
}

function isLikelyFullGame(game) {
  const text = normalizeText([game.title, game.description, game.platforms].filter(Boolean).join(' '));
  const blocked = [
    'dlc',
    'skin',
    'pack',
    'bundle',
    'coupon',
    'beta',
    'alpha',
    'loot',
    'in-game',
    'in game',
    'item',
    'starter',
    'add-on',
    'addon',
    'currency'
  ];

  return !blocked.some((word) => text.includes(word));
}

async function fetchJson(url, source) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GameWallProDiscordBot/0.1'
    }
  });

  if (!response.ok) {
    throw new Error(`${source} retornou HTTP ${response.status}`);
  }

  return response.json();
}

function parseGamerPower(giveaways) {
  return giveaways
    .filter((item) => item.status === 'Active')
    .map((item) => ({
      id: `gamerpower:${item.id}`,
      title: item.title,
      platforms: item.platforms || 'PC',
      source: 'GamerPower',
      worth: item.worth,
      endDate: item.end_date,
      url: item.open_giveaway_url || item.gamerpower_url,
      description: item.description
    }));
}

function parseEpic(data) {
  const elements = data.data?.Catalog?.searchStore?.elements ?? [];
  const now = Date.now();

  return elements
    .filter((item) => {
      const offers = item.promotions?.promotionalOffers ?? [];
      return offers.some((entry) =>
        (entry.promotionalOffers ?? []).some((offer) => {
          const start = new Date(offer.startDate).getTime();
          const end = new Date(offer.endDate).getTime();
          return Number.isFinite(start) && Number.isFinite(end) && start <= now && now <= end;
        })
      );
    })
    .map((item) => {
      const offers = item.promotions.promotionalOffers.flatMap((entry) => entry.promotionalOffers ?? []);
      const activeOffer = offers.find((offer) => {
        const start = new Date(offer.startDate).getTime();
        const end = new Date(offer.endDate).getTime();
        return start <= now && now <= end;
      });
      const slug = item.catalogNs?.mappings?.[0]?.pageSlug || item.productSlug || item.urlSlug;

      return {
        id: `epic:${item.id}`,
        title: item.title,
        platforms: 'Epic Games Store',
        source: 'Epic Games Store',
        worth: item.price?.totalPrice?.fmtPrice?.originalPrice,
        endDate: activeOffer?.endDate,
        url: slug ? `https://store.epicgames.com/p/${slug}` : 'https://store.epicgames.com/free-games',
        description: item.description || item.keyImages?.[0]?.type || ''
      };
    });
}

function dedupeGames(games) {
  const seen = new Set();
  const output = [];

  for (const game of games) {
    const key = `${game.title.toLowerCase()}::${game.platforms.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(game);
  }

  return output;
}

export async function fetchFreeGames(options = {}) {
  const platform = normalizePlatform(options.platform || 'all');
  const limit = Math.min(Math.max(options.limit || config.freeGames.maxResults, 1), 20);
  const fullOnly = options.fullOnly ?? config.freeGames.fullOnly;
  const errors = [];
  const games = [];

  const gamerPower = await fetchJson(gamerPowerUrl, 'GamerPower')
    .then(parseGamerPower)
    .catch((error) => {
      errors.push(error.message);
      return [];
    });
  games.push(...gamerPower);

  const epic = await fetchJson(epicUrl, 'Epic Games Store')
    .then(parseEpic)
    .catch((error) => {
      errors.push(error.message);
      return [];
    });
  games.push(...epic);

  const filtered = dedupeGames(
    games.filter((game) => matchesPlatform(game, platform) && (!fullOnly || isLikelyFullGame(game)))
  ).slice(0, limit);
  return { games: filtered, errors, platform };
}

export function platformChoices() {
  return [
    { name: 'Todas', value: 'all' },
    { name: 'PC', value: 'pc' },
    { name: 'Steam', value: 'steam' },
    { name: 'Epic Games', value: 'epic' },
    { name: 'GOG', value: 'gog' },
    { name: 'itch.io', value: 'itch' },
    { name: 'Xbox', value: 'xbox' },
    { name: 'PlayStation', value: 'playstation' },
    { name: 'Nintendo Switch', value: 'switch' },
    { name: 'Android', value: 'android' },
    { name: 'iOS', value: 'ios' }
  ];
}

export function formatFreeGames(games, options = {}) {
  if (games.length === 0) return 'Nao encontrei jogos gratis ativos agora para esse filtro.';

  const lines = games.map((game, index) => {
    const end = game.endDate && game.endDate !== 'N/A' ? ` | acaba: ${game.endDate}` : '';
    const worth = game.worth && game.worth !== 'N/A' ? ` | antes: ${game.worth}` : '';
    return `**${index + 1}. ${game.title}**\n${game.platforms} | ${game.source}${worth}${end}\n${game.url}`;
  });

  const header = options.header || 'Jogos gratis encontrados';
  return `**${header}**\n\n${lines.join('\n\n')}`;
}
