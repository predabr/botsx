import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Mostra informacoes de um usuario.')
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario para consultar.').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;

    await interaction.reply({
      ephemeral: true,
      content: [
        `**Usuario:** ${user.tag}`,
        `**ID:** ${user.id}`,
        `**Conta criada:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
        member ? `**Entrou no servidor:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : null
      ]
        .filter(Boolean)
        .join('\n')
    });
  }
};
