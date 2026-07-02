import { SlashCommandBuilder } from 'discord.js';

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Cria uma enquete simples.')
    .addStringOption((option) =>
      option.setName('question').setDescription('Pergunta da enquete.').setRequired(true).setMaxLength(300)
    )
    .addStringOption((option) =>
      option
        .setName('options')
        .setDescription('Opcoes separadas por virgula. Ex: Sim, Nao, Talvez')
        .setRequired(true)
        .setMaxLength(1000)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question', true);
    const options = interaction.options
      .getString('options', true)
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (options.length < 2) {
      await interaction.reply({ content: 'Use pelo menos duas opcoes separadas por virgula.', ephemeral: true });
      return;
    }

    const content = [`**${question}**`, ...options.map((option, index) => `${numberEmojis[index]} ${option}`)].join(
      '\n'
    );
    const message = await interaction.reply({ content, fetchReply: true });

    for (let index = 0; index < options.length; index += 1) {
      await message.react(numberEmojis[index]).catch(() => null);
    }
  }
};
