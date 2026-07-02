import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Mostra a latencia do bot.'),

  async execute(interaction) {
    const reply = await interaction.reply({ content: 'Calculando...', fetchReply: true });
    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! Bot: ${latency}ms | Gateway: ${Math.round(interaction.client.ws.ping)}ms`);
  }
};
