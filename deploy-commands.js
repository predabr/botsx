import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';
import { config, requireEnv } from './config.js';
import { loadCommands } from './lib/commandLoader.js';

requireEnv(['DISCORD_TOKEN', 'CLIENT_ID']);

const __dirname = dirname(fileURLToPath(import.meta.url));
const { commandData } = await loadCommands(join(__dirname, 'commands'));
const rest = new REST({ version: '10' }).setToken(config.discordToken);

const route = config.guildId
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)
  : Routes.applicationCommands(config.clientId);

await rest.put(route, { body: commandData });

console.log(
  `Registrados ${commandData.length} comandos ${config.guildId ? `no servidor ${config.guildId}` : 'globalmente'}.`
);
