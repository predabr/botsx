import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('skip').setDescription('Pula a musica atual.'),

  async execute(interaction) {
    const skipped = musicManager.skip(interaction.guildId);
    await interaction.reply(skipped ? 'Musica pulada.' : 'Nao tem musica tocando.');
  }
};
