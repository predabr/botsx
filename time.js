const units = {
  s: 1000,
  sec: 1000,
  segundo: 1000,
  segundos: 1000,
  m: 60 * 1000,
  min: 60 * 1000,
  minuto: 60 * 1000,
  minutos: 60 * 1000,
  h: 60 * 60 * 1000,
  hora: 60 * 60 * 1000,
  horas: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  dia: 24 * 60 * 60 * 1000,
  dias: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  semana: 7 * 24 * 60 * 60 * 1000,
  semanas: 7 * 24 * 60 * 60 * 1000
};

export function parseDuration(input) {
  const text = input.trim().toLowerCase();
  const matches = [...text.matchAll(/(\d+)\s*([a-z]+)/g)];

  if (matches.length === 0) return null;

  let total = 0;
  for (const match of matches) {
    const amount = Number(match[1]);
    const unit = units[match[2]];
    if (!unit) return null;
    total += amount * unit;
  }

  return total > 0 ? total : null;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return `${Math.floor(days / 7)}sem`;
}
