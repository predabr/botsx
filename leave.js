import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('leave').setDescription('Tira o bot do canal de voz.'),

  async execute(interaction) {
    const left = musicManager.leave(interaction.guildId);
    await interaction.reply(left ? 'Sai do canal de voz.' : 'Nao estou em canal de voz.');
  }
};
