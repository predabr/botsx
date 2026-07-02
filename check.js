import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCommands } from '../src/lib/commandLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsDirectory = join(__dirname, '..', 'src', 'commands');

const { commandData } = await loadCommands(commandsDirectory);
const names = commandData.map((command) => command.name).sort();
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

if (duplicates.length > 0) {
  throw new Error(`Duplicate command names: ${duplicates.join(', ')}`);
}

console.log(`OK: ${commandData.length} slash commands carregados.`);
