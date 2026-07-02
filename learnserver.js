import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import {
  addServerKnowledge,
  clearServerKnowledge,
  getGuildSettings
} from '../../lib/guildSettingsStore.js';
import { sendChunkedInteraction } from '../../lib/messages.js';

function cleanText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

export default {
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('learnserver')
    .setDescription('Ensina regras/conhecimento do servidor para a IA.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Adiciona conhecimento manual.')
        .addStringOption((option) =>
          option
            .setName('text')
            .setDescription('Texto que a IA deve lembrar sobre o servidor.')
            .setRequired(true)
            .setMaxLength(1200)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('channel')
        .setDescription('Importa mensagens recentes de um canal de regras/wiki.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Canal para aprender.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('Quantidade de mensagens, de 1 a 50.')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(50)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('show').setDescription('Mostra o que a IA aprendeu.'))
    .addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Apaga memoria do servidor.')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const entries = await addServerKnowledge(
        interaction.guildId,
        interaction.options.getString('text', true),
        `manual:${interaction.user.id}`
      );
      await interaction.reply({ content: `Conhecimento salvo. Total: ${entries.length}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'channel') {
      await interaction.deferReply({ ephemeral: true });
      const channel = interaction.options.getChannel('channel', true);
      const limit = interaction.options.getInteger('limit') || 20;
      const messages = await channel.messages.fetch({ limit });
      const text = [...messages.values()]
        .reverse()
        .filter((message) => !message.author.bot && cleanText(message.content))
        .map((message) => `- ${cleanText(message.content).slice(0, 300)}`)
        .join('\n');

      if (!text) {
        await interaction.editReply('Nao encontrei mensagens de texto para aprender nesse canal.');
        return;
      }

      const entries = await addServerKnowledge(interaction.guildId, text, `channel:${channel.id}`);
      await interaction.editReply(`Aprendi mensagens de ${channel}. Total de memorias do servidor: ${entries.length}.`);
      return;
    }

    if (subcommand === 'show') {
      const settings = await getGuildSettings(interaction.guildId);

      if (settings.serverKnowledge.length === 0) {
        await interaction.reply({ content: 'A IA ainda nao tem memoria do servidor.', ephemeral: true });
        return;
      }

      const lines = settings.serverKnowledge.map(
        (entry, index) => `**${index + 1}.** ${entry.text}\nFonte: ${entry.source}`
      );
      await sendChunkedInteraction(interaction, lines.join('\n\n'), { ephemeral: true });
      return;
    }

    if (subcommand === 'clear') {
      await clearServerKnowledge(interaction.guildId);
      await interaction.reply({ content: 'Memoria do servidor apagada.', ephemeral: true });
    }
  }
};
