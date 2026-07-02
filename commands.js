import { SlashCommandBuilder } from 'discord.js';
import { sendCommandList } from './help.js';

export default {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Lista todos os comandos disponiveis.'),

  async execute(interaction) {
    await sendCommandList(interaction);
  }
};
