import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('resume').setDescription('Continua a musica pausada.'),

  async execute(interaction) {
    const resumed = musicManager.resume(interaction.guildId);
    await interaction.reply(resumed ? 'Musica continuando.' : 'Nao consegui continuar.');
  }
};
