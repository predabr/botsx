import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Configura repeticao da musica.')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Modo de repeticao.')
        .setRequired(true)
        .addChoices(
          { name: 'Desligado', value: 'off' },
          { name: 'Musica atual', value: 'one' },
          { name: 'Fila toda', value: 'all' }
        )
    ),

  async execute(interaction) {
    const mode = musicManager.setRepeat(interaction.guildId, interaction.options.getString('mode', true));
    await interaction.reply(`Repeat: ${mode}.`);
  }
};
