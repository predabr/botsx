import { readJson, updateJson } from './jsonStore.js';

const fileName = 'reminders.json';
const maxTimeout = 2_000_000_000;
const timers = new Map();

function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function removeReminder(id) {
  await updateJson(fileName, { reminders: [] }, (data) => {
    data.reminders = data.reminders.filter((reminder) => reminder.id !== id);
  });
}

async function fireReminder(client, reminder) {
  timers.delete(reminder.id);

  const channel = await client.channels.fetch(reminder.channelId).catch(() => null);
  if (channel?.isTextBased()) {
    await channel
      .send(`<@${reminder.userId}> lembrete: ${reminder.text}`)
      .catch(() => null);
  }

  await removeReminder(reminder.id);
}

function scheduleReminder(client, reminder) {
  const dueAt = new Date(reminder.dueAt).getTime();
  const delay = dueAt - Date.now();

  if (delay <= 0) {
    fireReminder(client, reminder).catch((error) => console.error('Reminder failed', error));
    return;
  }

  const timer = setTimeout(() => scheduleReminder(client, reminder), Math.min(delay, maxTimeout));
  timers.set(reminder.id, timer);
}

export async function startReminderService(client) {
  const data = await readJson(fileName, { reminders: [] });
  for (const reminder of data.reminders) {
    scheduleReminder(client, reminder);
  }
}

export async function createReminder(client, reminder) {
  const entry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    ...reminder
  };

  await updateJson(fileName, { reminders: [] }, (data) => {
    data.reminders.push(entry);
  });

  scheduleReminder(client, entry);
  return entry;
}

export async function listReminders(userId) {
  const data = await readJson(fileName, { reminders: [] });
  return data.reminders
    .filter((reminder) => reminder.userId === userId)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

export async function cancelReminder(userId, id) {
  const reminders = await listReminders(userId);
  const exists = reminders.some((reminder) => reminder.id === id);
  if (!exists) return false;

  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  await removeReminder(id);
  return true;
}
