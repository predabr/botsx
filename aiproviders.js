import { SlashCommandBuilder } from 'discord.js';
import { aiProviders, isProviderConfigured } from '../../lib/aiProviders.js';

export default {
  data: new SlashCommandBuilder()
    .setName('aiproviders')
    .setDescription('Mostra quais provedores de IA estao configurados.'),

  async execute(interaction) {
    const lines = aiProviders.map((provider) => {
      const status = isProviderConfigured(provider) ? 'configurado' : 'pendente';
      return `**${provider.name}** (${provider.id}): ${status} | modelo: \`${provider.model}\``;
    });

    await interaction.reply({ content: lines.join('\n'), ephemeral: true });
  }
};
