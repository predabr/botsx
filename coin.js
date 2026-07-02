import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('coin').setDescription('Joga cara ou coroa.'),

  async execute(interaction) {
    await interaction.reply(Math.random() > 0.5 ? 'Cara' : 'Coroa');
  }
};
