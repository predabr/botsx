import { getGuildSettings } from '../lib/guildSettingsStore.js';

function fillTemplate(template, member) {
  return template
    .replaceAll('{user}', `${member}`)
    .replaceAll('{tag}', member.user.tag)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{count}', String(member.guild.memberCount));
}

export async function sendGuildLog(guild, content) {
  const settings = await getGuildSettings(guild.id);
  if (!settings.logChannelId) return;

  const channel = await guild.channels.fetch(settings.logChannelId).catch(() => null);
  if (channel?.isTextBased()) await channel.send(content).catch(() => null);
}

export async function handleGuildMemberAdd(member) {
  const settings = await getGuildSettings(member.guild.id);

  if (settings.autoRoleId) {
    await member.roles.add(settings.autoRoleId, 'Autorole configurado no bot').catch(() => null);
  }

  if (settings.welcomeChannelId) {
    const channel = await member.guild.channels.fetch(settings.welcomeChannelId).catch(() => null);
    if (channel?.isTextBased()) {
      await channel.send(fillTemplate(settings.welcomeMessage, member)).catch(() => null);
    }
  }

  await sendGuildLog(member.guild, `Entrada: ${member.user.tag} (${member.id})`);
}

export async function handleGuildMemberRemove(member) {
  await sendGuildLog(member.guild, `Saida: ${member.user.tag} (${member.id})`);
}

export async function handleMessageDelete(message) {
  if (!message.guild || message.author?.bot) return;
  const content = message.content ? message.content.slice(0, 900) : 'conteudo indisponivel';
  await sendGuildLog(
    message.guild,
    `Mensagem apagada em ${message.channel}: **${message.author?.tag ?? 'autor desconhecido'}**\n${content}`
  );
}

export async function handleMessageUpdate(oldMessage, newMessage) {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  await sendGuildLog(
    newMessage.guild,
    [
      `Mensagem editada em ${newMessage.channel}: **${newMessage.author?.tag ?? 'autor desconhecido'}**`,
      `Antes: ${(oldMessage.content || 'indisponivel').slice(0, 500)}`,
      `Depois: ${(newMessage.content || 'indisponivel').slice(0, 500)}`
    ].join('\n')
  );
}
