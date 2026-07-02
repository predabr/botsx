import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
  data: new SlashCommandBuilder().setName('invite').setDescription('Gera o link para convidar o bot.'),

  async execute(interaction) {
    if (!config.clientId) {
      await interaction.reply({ content: 'Configure CLIENT_ID no .env para gerar o invite.', ephemeral: true });
      return;
    }

    const url = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`;
    await interaction.reply({ content: url, ephemeral: true });
  }
};
