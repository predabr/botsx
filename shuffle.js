import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Embaralha a fila de musicas.'),

  async execute(interaction) {
    const ok = musicManager.shuffle(interaction.guildId);
    await interaction.reply(ok ? 'Fila embaralhada.' : 'Preciso de pelo menos duas musicas na fila.');
  }
};
