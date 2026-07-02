import { SlashCommandBuilder } from 'discord.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Mostra informacoes do servidor.'),

  async execute(interaction) {
    const { guild } = interaction;

    await interaction.reply({
      ephemeral: true,
      content: [
        `**Servidor:** ${guild.name}`,
        `**ID:** ${guild.id}`,
        `**Dono:** <@${guild.ownerId}>`,
        `**Membros:** ${guild.memberCount}`,
        `**Criado em:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
      ].join('\n')
    });
  }
};
