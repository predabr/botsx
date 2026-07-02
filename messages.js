const DISCORD_MESSAGE_LIMIT = 2000;

export function chunkText(text, limit = 1900) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > limit) {
    let splitAt = remaining.lastIndexOf('\n', limit);
    if (splitAt < limit * 0.5) splitAt = remaining.lastIndexOf(' ', limit);
    if (splitAt < limit * 0.5) splitAt = limit;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export async function sendChunkedInteraction(interaction, text, options = {}) {
  const chunks = chunkText(text, DISCORD_MESSAGE_LIMIT - 100);
  const [first, ...rest] = chunks;
  const ephemeral = Boolean(options.ephemeral);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply(first);
  } else {
    await interaction.reply({ content: first, ephemeral });
  }

  for (const chunk of rest) {
    await interaction.followUp({ content: chunk, ephemeral });
  }
}
