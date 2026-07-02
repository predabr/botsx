import { readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';

async function collectCommandFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectCommandFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function loadCommands(commandsDirectory) {
  const commands = new Collection();
  const commandData = [];
  const root = resolve(commandsDirectory);
  const files = await collectCommandFiles(root);

  for (const file of files) {
    const module = await import(pathToFileURL(file).href);
    const command = module.default;

    if (!command?.data || typeof command.execute !== 'function') {
      throw new Error(`Invalid command module: ${file}`);
    }

    command.category = relative(root, file).split(sep)[0] || 'utility';
    commands.set(command.data.name, command);
    commandData.push(command.data.toJSON());
  }

  return { commands, commandData };
}
