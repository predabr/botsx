import { SlashCommandBuilder } from 'discord.js';
import { musicManager } from '../../lib/musicManager.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('stop').setDescription('Para a musica e limpa a fila.'),

  async execute(interaction) {
    const stopped = musicManager.stop(interaction.guildId);
    await interaction.reply(stopped ? 'Musica parada e fila limpa.' : 'Nao tem fila ativa.');
  }
};
