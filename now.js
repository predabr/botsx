import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('now').setDescription('Mostra a musica atual.'),

  async execute(interaction) {
    const state = musicManager.getQueue(interaction.guildId);
    await interaction.reply(
      state.current ? `Tocando agora: **${state.current.title}**` : 'Nao tem musica tocando agora.'
    );
  }
};
