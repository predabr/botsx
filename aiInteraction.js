import { config } from '../config.js';
import { chatCompletion } from './aiProviders.js';
import { conversationKey, getConversation, saveConversation } from './conversationStore.js';
import { formatMemoriesForPrompt, getMemories } from './memoryStore.js';
import { sendChunkedInteraction } from './messages.js';
import { buildServerContext } from './serverContext.js';

export async function runAiInteraction(interaction, prompt, providerId, options = {}) {
  const key = conversationKey(interaction);
  const history = await getConversation(key);
  const memories = config.ai.memoryEnabled ? await getMemories(interaction.user.id) : [];
  const memoryPrompt = formatMemoriesForPrompt(memories);
  const serverContext = await buildServerContext(interaction);

  if (serverContext.settings && !serverContext.settings.aiEnabled) {
    throw new Error('A IA esta desligada neste servidor. Use /config ai para ligar.');
  }

  if (
    serverContext.settings?.aiChannelId &&
    serverContext.settings.aiChannelId !== interaction.channelId
  ) {
    throw new Error(`Use a IA em <#${serverContext.settings.aiChannelId}>.`);
  }

  const systemContent = [config.ai.systemPrompt, serverContext.prompt, memoryPrompt]
    .filter(Boolean)
    .join('\n\n');

  await interaction.deferReply({ ephemeral: Boolean(options.ephemeral) });

  const messages = [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: prompt }
  ];

  const result = await chatCompletion(providerId || config.ai.defaultProvider, messages);

  await saveConversation(
    key,
    [...history, { role: 'user', content: prompt }, { role: 'assistant', content: result.content }],
    config.ai.maxHistory
  );

  await sendChunkedInteraction(
    interaction,
    `**${result.provider.name} / ${result.model}**\n${result.content}`,
    { ephemeral: Boolean(options.ephemeral) }
  );
}
