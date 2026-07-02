import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function buildFreeGameButtons(games) {
  const buttons = games
    .filter((game) => game.url)
    .slice(0, 5)
    .map((game, index) =>
      new ButtonBuilder()
        .setLabel(`Pegar ${index + 1}`)
        .setStyle(ButtonStyle.Link)
        .setURL(game.url)
    );

  return buttons.length > 0 ? [new ActionRowBuilder().addComponents(...buttons)] : [];
}
