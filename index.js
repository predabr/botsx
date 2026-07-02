import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import { config, requireEnv } from './config.js';
import {
  handleGuildMemberAdd,
  handleGuildMemberRemove,
  handleMessageDelete,
  handleMessageUpdate
} from './events/guildEvents.js';
import { loadCommands } from './lib/commandLoader.js';
import { handleInteraction } from './events/interactionCreate.js';
import { handleMessageCreate } from './events/messageCreate.js';
import { startFreeGamesWatcher } from './lib/freeGamesWatcher.js';
import { startHealthServer } from './lib/healthServer.js';
import { startReminderService } from './lib/reminderStore.js';

requireEnv(['DISCORD_TOKEN']);

const __dirname = dirname(fileURLToPath(import.meta.url));
const { commands } = await loadCommands(join(__dirname, 'commands'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

client.commands = new Collection(commands);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Online como ${readyClient.user.tag}`);
  console.log(`Comandos carregados: ${client.commands.size}`);
  if (config.automod.enabled) console.log('Auto moderacao ativa');
  startReminderService(client).catch((error) => console.error('Reminder service failed', error));
  startFreeGamesWatcher(client);
});

client.on(Events.InteractionCreate, handleInteraction);
client.on(Events.MessageCreate, handleMessageCreate);
client.on(Events.GuildMemberAdd, handleGuildMemberAdd);
client.on(Events.GuildMemberRemove, handleGuildMemberRemove);
client.on(Events.MessageDelete, handleMessageDelete);
client.on(Events.MessageUpdate, handleMessageUpdate);

startHealthServer(client);

await client.login(config.discordToken);
