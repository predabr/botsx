const userAgent = 'GameWallProDiscordBot/0.1 (Discord bot research command)';

function normalizeLanguage(language) {
  return ['pt', 'en', 'es'].includes(language) ? language : 'pt';
}

function stripHtml(text = '') {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': userAgent
    }
  });

  if (!response.ok) {
    throw new Error(`Pesquisa retornou HTTP ${response.status}`);
  }

  return response.json();
}

export async function searchWiki(query, options = {}) {
  const language = normalizeLanguage(options.language || 'pt');
  const limit = Math.min(Math.max(options.limit || 3, 1), 5);
  const url = new URL(`https://${language}.wikipedia.org/w/api.php`);

  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('srsearch', query);
  url.searchParams.set('srlimit', String(limit));
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const data = await fetchJson(url);

  return (data.query?.search ?? []).map((result) => ({
    title: result.title,
    snippet: stripHtml(result.snippet),
    pageId: result.pageid,
    language
  }));
}

export async function getWikiSummary(title, language = 'pt') {
  const normalizedLanguage = normalizeLanguage(language);
  const url = `https://${normalizedLanguage}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchJson(url);

  return {
    title: data.title || title,
    extract: data.extract || '',
    url: data.content_urls?.desktop?.page || `https://${normalizedLanguage}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumbnail: data.thumbnail?.source,
    language: normalizedLanguage
  };
}

export async function researchWiki(query, options = {}) {
  const searchResults = await searchWiki(query, options);
  const summaries = [];

  for (const result of searchResults) {
    const summary = await getWikiSummary(result.title, result.language).catch(() => null);
    if (summary?.extract) summaries.push(summary);
  }

  return summaries;
}
