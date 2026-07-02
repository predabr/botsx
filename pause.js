import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('pause').setDescription('Pausa a musica.'),

  async execute(interaction) {
    const paused = musicManager.pause(interaction.guildId);
    await interaction.reply(paused ? 'Musica pausada.' : 'Nao consegui pausar.');
  }
};
