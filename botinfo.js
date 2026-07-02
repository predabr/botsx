import { SlashCommandBuilder } from 'discord.js';

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export default {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Mostra status do bot.'),

  async execute(interaction) {
    const guilds = interaction.client.guilds.cache.size;
    const users = interaction.client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
    const uptime = formatUptime(Math.floor(interaction.client.uptime / 1000));

    await interaction.reply({
      ephemeral: true,
      content: [
        `Online ha: ${uptime}`,
        `Servidores: ${guilds}`,
        `Usuarios vistos: ${users}`,
        `Ping gateway: ${Math.round(interaction.client.ws.ping)}ms`
      ].join('\n')
    });
  }
};
