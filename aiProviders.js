import { config } from '../config.js';

const defaultHeaders = {
  'Content-Type': 'application/json'
};

export const aiProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    extraHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://localhost',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'GameWallPro Bot'
    }
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
  },
  {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    apiKey: process.env.TOGETHER_API_KEY,
    model: process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  },
  {
    id: 'local',
    name: 'Local AI',
    baseUrl: process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.LOCAL_AI_API_KEY || 'local',
    model: process.env.LOCAL_AI_MODEL || 'llama3.1',
    enabled: process.env.LOCAL_AI_ENABLED === 'true'
  }
];

export function listProviderChoices() {
  return aiProviders.map((provider) => ({
    name: provider.name,
    value: provider.id
  }));
}

export function getProvider(providerId = config.ai.defaultProvider) {
  return aiProviders.find((provider) => provider.id === providerId) ?? aiProviders[0];
}

export function isProviderConfigured(provider) {
  if (provider.id === 'local') return provider.enabled;
  return Boolean(provider.apiKey);
}

export async function chatCompletion(providerId, messages) {
  const provider = getProvider(providerId);

  if (!isProviderConfigured(provider)) {
    throw new Error(
      `${provider.name} nao esta configurado. Preencha a chave no .env ou escolha outro provider.`
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.ai.timeoutMs);

  try {
    const response = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(provider.extraHeaders ?? {}),
        Authorization: `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature
      }),
      signal: controller.signal
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new Error(`${provider.name} respondeu HTTP ${response.status}: ${raw.slice(0, 400)}`);
    }

    const data = JSON.parse(raw);
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error(`${provider.name} nao retornou conteudo.`);
    }

    return {
      content,
      provider,
      model: data.model || provider.model
    };
  } finally {
    clearTimeout(timer);
  }
}
