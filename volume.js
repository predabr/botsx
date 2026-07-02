import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta o volume da musica.')
    .addIntegerOption((option) =>
      option
        .setName('value')
        .setDescription('Volume de 0 a 100.')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const volume = musicManager.setVolume(interaction.guildId, interaction.options.getInteger('value', true));
    await interaction.reply(volume === null ? 'Nao tem player ativo.' : `Volume em ${volume}%.`);
  }
};
