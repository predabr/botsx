import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rola dados.')
    .addIntegerOption((option) =>
      option
        .setName('dice')
        .setDescription('Quantidade de dados.')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('sides')
        .setDescription('Lados por dado.')
        .setMinValue(2)
        .setMaxValue(1000)
        .setRequired(false)
    ),

  async execute(interaction) {
    const dice = interaction.options.getInteger('dice') || 1;
    const sides = interaction.options.getInteger('sides') || 6;
    const rolls = Array.from({ length: dice }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((sum, value) => sum + value, 0);

    await interaction.reply(`Rolagem ${dice}d${sides}: ${rolls.join(', ')} | Total: **${total}**`);
  }
};
