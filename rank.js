import { SlashCommandBuilder } from 'discord.js';
import { getRank } from '../../lib/xpStore.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Mostra seu nivel no servidor.')
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuario para consultar.').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const rank = await getRank(interaction.guildId, user.id);

    await interaction.reply(
      [
        `Rank de **${user.tag}**`,
        `Posicao: #${rank.rank}`,
        `Nivel: ${rank.level}`,
        `XP: ${rank.xp}/${rank.nextLevelXp}`,
        `Mensagens com XP: ${rank.messages}`
      ].join('\n')
    );
  }
};
