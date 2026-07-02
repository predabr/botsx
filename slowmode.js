import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Define o modo lento do canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('Segundos entre mensagens. Use 0 para desligar.')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds', true);
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({
      content: seconds === 0 ? 'Modo lento desligado.' : `Modo lento em ${seconds}s.`,
      ephemeral: true
    });
  }
};
