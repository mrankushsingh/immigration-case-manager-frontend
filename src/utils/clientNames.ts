import { formatReminderFullName } from './reminderNames';

export function formatClientFullName(
  client: { first_name?: string; last_name?: string } | null | undefined
): string {
  if (!client) return '';
  return formatReminderFullName(client.first_name, client.last_name);
}

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Match client by first name, surname, or any alphabetical substring in the name. */
export function clientMatchesNameSearch(
  client: { first_name?: string; last_name?: string } | null | undefined,
  raw: string
): boolean {
  const query = normalizeSearchText(raw);
  if (!query) return true;

  const first = normalizeSearchText(client?.first_name || '');
  const last = normalizeSearchText(client?.last_name || '');
  const full = normalizeSearchText(formatClientFullName(client));
  const nameParts = Array.from(new Set([first, last, ...full.split(/\s+/).filter(Boolean)]));

  if (first.includes(query) || last.includes(query) || full.includes(query)) {
    return true;
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every((token) => nameParts.some((part) => part.includes(token)));
  }

  return nameParts.some((part) => part.includes(query));
}
