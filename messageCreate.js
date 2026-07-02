import { PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';
import { chatCompletion } from '../lib/aiProviders.js';
import { getConversation, saveConversation } from '../lib/conversationStore.js';
import { formatMemoriesForPrompt, getMemories } from '../lib/memoryStore.js';
import { chunkText } from '../lib/messages.js';
import { buildServerContext } from '../lib/serverContext.js';
import { addXpFromMessage } from '../lib/xpStore.js';

const invitePattern = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\//i;

async function removeMessage(message, reason) {
  const me = message.guild.members.me;
  const canManage = me?.permissions.has(PermissionFlagsBits.ManageMessages);
  if (!canManage) return false;

  const deleted = await message.delete().then(() => true).catch(() => false);
  if (!deleted) return false;

  const notice = await message.channel
    .send(`${message.author}, mensagem removida: ${reason}.`)
    .catch(() => null);

  if (notice) {
    setTimeout(() => notice.delete().catch(() => null), 5000);
  }

  return true;
}

async function handleAutoMod(message) {
  if (!config.automod.enabled) return false;

  const mentions = message.mentions.users.size + message.mentions.roles.size;
  if (mentions > config.automod.maxMentions) {
    return removeMessage(message, 'muitas mencoes');
  }

  if (config.automod.blockInvites && invitePattern.test(message.content)) {
    return removeMessage(message, 'convites nao permitidos');
  }

  const content = message.content.toLowerCase();
  const blockedWord = config.automod.blockedWords.find((word) => content.includes(word));
  if (blockedWord) {
    return removeMessage(message, `palavra bloqueada (${blockedWord})`);
  }

  return false;
}

async function handleXp(message) {
  const result = await addXpFromMessage(message);
  if (!result?.leveledUp || !config.xp.levelUpMessages) return;

  await message.channel
    .send(`${message.author} subiu para o nivel **${result.newLevel}**.`)
    .catch(() => null);
}

async function handleAiMention(message) {
  if (!config.ai.replyOnMention || !message.mentions.users.has(message.client.user.id)) return;

  const mentionPattern = new RegExp(`<@!?${message.client.user.id}>`, 'g');
  const prompt = message.content.replace(mentionPattern, '').trim();
  if (!prompt) return;

  await message.channel.sendTyping().catch(() => null);

  const key = [message.guildId, message.channelId, message.author.id].join(':');
  const history = await getConversation(key);
  const memories = config.ai.memoryEnabled ? await getMemories(message.author.id) : [];
  const memoryPrompt = formatMemoriesForPrompt(memories);
  const serverContext = await buildServerContext({
    guildId: message.guildId,
    guild: message.guild,
    channelId: message.channelId
  });

  if (serverContext.settings && !serverContext.settings.aiEnabled) return;
  if (serverContext.settings?.aiChannelId && serverContext.settings.aiChannelId !== message.channelId) return;

  const systemContent = [config.ai.systemPrompt, serverContext.prompt, memoryPrompt]
    .filter(Boolean)
    .join('\n\n');

  const result = await chatCompletion(config.ai.defaultProvider, [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: prompt }
  ]);

  await saveConversation(
    key,
    [...history, { role: 'user', content: prompt }, { role: 'assistant', content: result.content }],
    config.ai.maxHistory
  );

  for (const chunk of chunkText(result.content)) {
    await message.channel.send(chunk);
  }
}

export async function handleMessageCreate(message) {
  if (!message.guild || message.author.bot) return;

  const removed = await handleAutoMod(message);
  if (removed) return;

  await handleXp(message).catch((error) => console.error('XP handler failed', error));
  await handleAiMention(message).catch(async (error) => {
    console.error('AI mention failed', error);
    await message.channel.send(`Erro na IA: ${error.message}`).catch(() => null);
  });
}
