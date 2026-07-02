import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostra o avatar de um usuario.')
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario para ver o avatar.').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const url = user.displayAvatarURL({ size: 1024 });
    await interaction.reply({ content: `Avatar de **${user.tag}**: ${url}` });
  }
};
