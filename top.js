import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../../lib/xpStore.js';

export default {
  guildOnly: true,
  data: new SlashCommandBuilder().setName('top').setDescription('Mostra o top XP do servidor.'),

  async execute(interaction) {
    const leaderboard = await getLeaderboard(interaction.guildId, 10);

    if (leaderboard.length === 0) {
      await interaction.reply('Ainda nao tem XP registrado.');
      return;
    }

    const lines = leaderboard.map(
      (entry) => `**#${entry.position}** <@${entry.userId}> - nivel ${entry.level}, ${entry.xp} XP`
    );
    await interaction.reply(lines.join('\n'));
  }
};
