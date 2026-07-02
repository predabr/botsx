import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configuredDataDirectory = process.env.DATA_DIR || './data';
const dataDirectory = isAbsolute(configuredDataDirectory)
  ? configuredDataDirectory
  : resolve(join(__dirname, '..', '..'), configuredDataDirectory);
const queues = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function filePath(fileName) {
  return join(dataDirectory, fileName);
}

export async function readJson(fileName, fallback) {
  try {
    const raw = await readFile(filePath(fileName), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return clone(fallback);
    throw error;
  }
}

export async function writeJson(fileName, data) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(filePath(fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function updateJson(fileName, fallback, updater) {
  const previous = queues.get(fileName) ?? Promise.resolve();

  const next = previous.then(async () => {
    const data = await readJson(fileName, fallback);
    const result = await updater(data);
    await writeJson(fileName, data);
    return result ?? data;
  });

  queues.set(
    fileName,
    next.catch(() => null)
  );

  return next;
}
