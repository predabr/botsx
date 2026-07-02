import { config } from '../config.js';
import { researchWiki } from './wikiClient.js';

function cleanText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function flattenRelatedTopics(topics = []) {
  const output = [];

  for (const topic of topics) {
    if (topic.Topics) {
      output.push(...flattenRelatedTopics(topic.Topics));
    } else if (topic.Text && topic.FirstURL) {
      output.push({
        title: topic.Text.split(' - ')[0].slice(0, 120),
        snippet: topic.Text,
        url: topic.FirstURL,
        source: 'DuckDuckGo'
      });
    }
  }

  return output;
}

async function duckDuckGoSearch(query) {
  const url = new URL('https://api.duckduckgo.com/');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');
  url.searchParams.set('skip_disambig', '1');
  url.searchParams.set('t', 'GameWallProBot');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GameWallProDiscordBot/0.1'
    }
  });

  if (!response.ok) throw new Error(`DuckDuckGo retornou HTTP ${response.status}`);
  const data = await response.json();
  const results = [];

  if (data.AbstractText && data.AbstractURL) {
    results.push({
      title: data.Heading || query,
      snippet: cleanText(data.AbstractText),
      url: data.AbstractURL,
      source: 'DuckDuckGo'
    });
  }

  results.push(...flattenRelatedTopics(data.RelatedTopics));
  return results;
}

export async function searchWeb(query, options = {}) {
  const limit = Math.min(Math.max(options.limit || config.ai.webSearchSources, 1), 10);
  const sources = [];
  const errors = [];

  const duck = await duckDuckGoSearch(query).catch((error) => {
    errors.push(error.message);
    return [];
  });
  sources.push(...duck);

  const wiki = await researchWiki(query, { language: options.language || 'pt', limit: 4 }).catch((error) => {
    errors.push(error.message);
    return [];
  });
  sources.push(
    ...wiki.map((page) => ({
      title: page.title,
      snippet: page.extract,
      url: page.url,
      source: 'Wikipedia'
    }))
  );

  const seen = new Set();
  const deduped = sources.filter((source) => {
    const key = source.url || source.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return source.snippet;
  });

  return {
    sources: deduped.slice(0, limit),
    errors
  };
}
