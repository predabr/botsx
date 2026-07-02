import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { buildFreeGameButtons } from '../../lib/freeGameButtons.js';
import { fetchFreeGames, formatFreeGames, platformChoices } from '../../lib/freeGames.js';
import {
  getFreeGamesWatcher,
  removeFreeGamesWatcher,
  setFreeGamesWatcher
} from '../../lib/freeGamesWatcher.js';
import { chunkText, sendChunkedInteraction } from '../../lib/messages.js';

function assertManageGuild(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    throw new Error('Voce precisa da permissao Gerenciar Servidor para mexer no aviso automatico.');
  }
}

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('freegames')
    .setDescription('Mostra e avisa jogos gratis disponiveis.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('now')
        .setDescription('Mostra jogos gratis ativos agora.')
        .addStringOption((option) =>
          option
            .setName('platform')
            .setDescription('Filtro de plataforma.')
            .setRequired(false)
            .addChoices(...platformChoices())
        )
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('Quantidade de resultados.')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        )
        .addBooleanOption((option) =>
          option
            .setName('full_only')
            .setDescription('Mostrar so jogos completos, filtrando DLC/cupom/item.')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('watch')
        .setDescription('Ativa aviso automatico de novos jogos gratis.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Canal onde avisar.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
        .addStringOption((option) =>
          option
            .setName('platform')
            .setDescription('Filtro de plataforma.')
            .setRequired(false)
            .addChoices(...platformChoices())
        )
        .addBooleanOption((option) =>
          option
            .setName('ping_everyone')
            .setDescription('Marcar @everyone quando aparecer jogo novo.')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('status').setDescription('Mostra o canal configurado para avisos.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('off').setDescription('Desativa aviso automatico de jogos gratis.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'now') {
      await interaction.deferReply();
      const platform = interaction.options.getString('platform') || 'all';
      const limit = interaction.options.getInteger('limit') || 12;
      const fullOnly = interaction.options.getBoolean('full_only');
      const { games, errors } = await fetchFreeGames({ platform, limit, fullOnly: fullOnly ?? true });
      const warning = errors.length > 0 ? `\n\nAvisos de fonte: ${errors.join(' | ')}` : '';

      await sendChunkedInteraction(
        interaction,
        `${formatFreeGames(games, { header: 'Jogos gratis ativos agora' })}${warning}`
      );
      if (games.length > 0) {
        await interaction.followUp({
          content: 'Links rapidos:',
          components: buildFreeGameButtons(games)
        });
      }
      return;
    }

    if (subcommand === 'watch') {
      assertManageGuild(interaction);
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.options.getChannel('channel', true);
      const platform = interaction.options.getString('platform') || 'all';
      const pingEveryone = interaction.options.getBoolean('ping_everyone') || false;
      const { games } = await fetchFreeGames({ platform, limit: 20 });

      await setFreeGamesWatcher(interaction.guildId, {
        channelId: channel.id,
        platform,
        pingEveryone,
        seenIds: games.map((game) => game.id)
      });

      await interaction.editReply(`Aviso automatico ativado em ${channel}. Filtro: ${platform}.`);

      if (games.length > 0) {
        const chunks = chunkText(formatFreeGames(games, { header: 'Jogos gratis disponiveis agora' }));
        for (const [index, chunk] of chunks.entries()) {
          await channel.send({
            content: chunk,
            components: index === 0 ? buildFreeGameButtons(games) : []
          });
        }
      }
      return;
    }

    if (subcommand === 'status') {
      const watcher = await getFreeGamesWatcher(interaction.guildId);

      if (!watcher) {
        await interaction.reply({ content: 'Aviso automatico de jogos gratis esta desligado.', ephemeral: true });
        return;
      }

      await interaction.reply({
        content: `Aviso automatico ligado em <#${watcher.channelId}>. Filtro: ${watcher.platform}. @everyone: ${
          watcher.pingEveryone ? 'sim' : 'nao'
        }.`,
        ephemeral: true
      });
      return;
    }

    if (subcommand === 'off') {
      assertManageGuild(interaction);
      await removeFreeGamesWatcher(interaction.guildId);
      await interaction.reply({ content: 'Aviso automatico de jogos gratis desligado.', ephemeral: true });
    }
  }
};
