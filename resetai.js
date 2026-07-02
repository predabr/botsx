import { SlashCommandBuilder } from 'discord.js';
import { conversationKey, resetConversation } from '../../lib/conversationStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resetai')
    .setDescription('Limpa o historico da sua conversa com a IA neste canal.'),

  async execute(interaction) {
    await resetConversation(conversationKey(interaction));
    await interaction.reply({ content: 'Historico de IA limpo para voce neste canal.', ephemeral: true });
  }
};
