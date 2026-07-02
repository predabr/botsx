import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { platformChoices } from '../../lib/freeGames.js';
import { fetchFreeGames } from '../../lib/freeGames.js';
import { setFreeGamesWatcher } from '../../lib/freeGamesWatcher.js';
import { getGuildSettings, updateGuildSettings } from '../../lib/guildSettingsStore.js';
import { formatChannel, formatRole } from '../../lib/serverContext.js';

function textChannelOption(option, name, description, required = false) {
  return option
    .setName(name)
    .setDescription(description)
    .setRequired(required)
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
}

function requireGuildManager(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    throw new Error('Voce precisa da permissao Gerenciar Servidor para usar /config.');
  }
}

function yesNo(value) {
  return value ? 'sim' : 'nao';
}

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configura sistemas do bot no servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand.setName('view').setDescription('Mostra a configuracao atual.'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('logs')
        .setDescription('Configura canal de logs.')
        .addChannelOption((option) => textChannelOption(option, 'channel', 'Canal de logs.', false))
        .addBooleanOption((option) =>
          option.setName('off').setDescription('Desligar logs.').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('welcome')
        .setDescription('Configura boas-vindas.')
        .addChannelOption((option) => textChannelOption(option, 'channel', 'Canal de boas-vindas.', false))
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('Use {user}, {tag}, {server}, {count}.')
            .setRequired(false)
            .setMaxLength(500)
        )
        .addBooleanOption((option) =>
          option.setName('off').setDescription('Desligar boas-vindas.').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('autorole')
        .setDescription('Configura cargo automatico ao entrar.')
        .addRoleOption((option) =>
          option.setName('role').setDescription('Cargo automatico.').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('off').setDescription('Desligar autorole.').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ai')
        .setDescription('Configura IA do servidor.')
        .addBooleanOption((option) => option.setName('enabled').setDescription('Ligar/desligar IA.'))
        .addChannelOption((option) => textChannelOption(option, 'channel', 'Canal exclusivo para IA.', false))
        .addChannelOption((option) =>
          textChannelOption(option, 'rules_channel', 'Canal de regras/wiki que a IA deve consultar.', false)
        )
        .addStringOption((option) =>
          option
            .setName('persona')
            .setDescription('Estilo/persona da IA neste servidor.')
            .setRequired(false)
            .setMaxLength(800)
        )
        .addBooleanOption((option) =>
          option.setName('clear_channel').setDescription('Remover canal exclusivo da IA.')
        )
        .addBooleanOption((option) =>
          option.setName('clear_rules').setDescription('Remover canal de regras/wiki.')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('freegames')
        .setDescription('Configura aviso automatico de jogos gratis.')
        .addChannelOption((option) =>
          textChannelOption(option, 'channel', 'Canal para avisos de jogos gratis.', true)
        )
        .addStringOption((option) =>
          option
            .setName('platform')
            .setDescription('Filtro de plataforma.')
            .setRequired(false)
            .addChoices(...platformChoices())
        )
        .addBooleanOption((option) =>
          option.setName('ping_everyone').setDescription('Marcar @everyone nos avisos.').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('music')
        .setDescription('Configura musica.')
        .addIntegerOption((option) =>
          option
            .setName('volume')
            .setDescription('Volume padrao de 0 a 100.')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(100)
        )
    ),

  async execute(interaction) {
    requireGuildManager(interaction);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const settings = await getGuildSettings(interaction.guildId);
      await interaction.reply({
        ephemeral: true,
        content: [
          `Logs: ${formatChannel(settings.logChannelId)}`,
          `Boas-vindas: ${formatChannel(settings.welcomeChannelId)}`,
          `Mensagem boas-vindas: ${settings.welcomeMessage}`,
          `Autorole: ${formatRole(settings.autoRoleId)}`,
          `IA ligada: ${yesNo(settings.aiEnabled)}`,
          `Canal IA: ${formatChannel(settings.aiChannelId)}`,
          `Canal regras/wiki IA: ${formatChannel(settings.aiRulesChannelId)}`,
          `Persona IA: ${settings.aiPersona || 'padrao'}`,
          `Memorias do servidor: ${settings.serverKnowledge.length}`,
          `Volume padrao musica: ${settings.musicDefaultVolume ?? 'padrao do .env'}`
        ].join('\n')
      });
      return;
    }

    if (subcommand === 'logs') {
      const off = interaction.options.getBoolean('off') || false;
      const channel = interaction.options.getChannel('channel');
      if (!off && !channel) {
        await interaction.reply({ content: 'Informe um canal ou use `off:true`.', ephemeral: true });
        return;
      }
      await updateGuildSettings(interaction.guildId, (settings) => {
        settings.logChannelId = off ? null : channel?.id ?? settings.logChannelId;
      });
      await interaction.reply({ content: off ? 'Logs desligados.' : `Logs em ${channel}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'welcome') {
      const off = interaction.options.getBoolean('off') || false;
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      await updateGuildSettings(interaction.guildId, (settings) => {
        if (off) settings.welcomeChannelId = null;
        if (channel) settings.welcomeChannelId = channel.id;
        if (message) settings.welcomeMessage = message;
      });
      await interaction.reply({ content: off ? 'Boas-vindas desligadas.' : 'Boas-vindas atualizadas.', ephemeral: true });
      return;
    }

    if (subcommand === 'autorole') {
      const off = interaction.options.getBoolean('off') || false;
      const role = interaction.options.getRole('role');
      if (!off && !role) {
        await interaction.reply({ content: 'Informe um cargo ou use `off:true`.', ephemeral: true });
        return;
      }
      await updateGuildSettings(interaction.guildId, (settings) => {
        settings.autoRoleId = off ? null : role?.id ?? settings.autoRoleId;
      });
      await interaction.reply({ content: off ? 'Autorole desligado.' : `Autorole: ${role}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'ai') {
      const enabled = interaction.options.getBoolean('enabled');
      const channel = interaction.options.getChannel('channel');
      const rulesChannel = interaction.options.getChannel('rules_channel');
      const persona = interaction.options.getString('persona');
      const clearChannel = interaction.options.getBoolean('clear_channel') || false;
      const clearRules = interaction.options.getBoolean('clear_rules') || false;

      await updateGuildSettings(interaction.guildId, (settings) => {
        if (typeof enabled === 'boolean') settings.aiEnabled = enabled;
        if (channel) settings.aiChannelId = channel.id;
        if (rulesChannel) settings.aiRulesChannelId = rulesChannel.id;
        if (persona !== null) settings.aiPersona = persona;
        if (clearChannel) settings.aiChannelId = null;
        if (clearRules) settings.aiRulesChannelId = null;
      });

      await interaction.reply({ content: 'Configuracao de IA atualizada.', ephemeral: true });
      return;
    }

    if (subcommand === 'freegames') {
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

      await interaction.editReply(`Jogos gratis configurado em ${channel}. Filtro: ${platform}.`);
      return;
    }

    if (subcommand === 'music') {
      const volume = interaction.options.getInteger('volume', true);
      await updateGuildSettings(interaction.guildId, (settings) => {
        settings.musicDefaultVolume = volume;
      });
      await interaction.reply({ content: `Volume padrao de musica configurado para ${volume}%.`, ephemeral: true });
    }
  }
};
