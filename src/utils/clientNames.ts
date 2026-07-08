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

/** All searchable name tokens: each first-name word, surname word, and formatted full name word. */
export function getClientSearchNameTokens(
  client: { first_name?: string; last_name?: string } | null | undefined
): string[] {
  const first = normalizeSearchText(client?.first_name || '');
  const last = normalizeSearchText(client?.last_name || '');
  const full = normalizeSearchText(formatClientFullName(client));

  const tokens = new Set<string>();
  const addWords = (value: string) => {
    if (!value) return;
    value.split(/\s+/).filter(Boolean).forEach((word) => tokens.add(word));
  };

  addWords(full);
  addWords(first);
  if (last && last !== first) {
    addWords(last);
  }

  return Array.from(tokens);
}

function nameTokenMatches(token: string, query: string): boolean {
  return token.startsWith(query) || token.includes(query);
}

/** Match client by first name, surname, or any alphabetical substring in any name word. */
export function clientMatchesNameSearch(
  client: { first_name?: string; last_name?: string } | null | undefined,
  raw: string
): boolean {
  const query = normalizeSearchText(raw);
  if (!query) return true;

  const nameTokens = getClientSearchNameTokens(client);
  if (nameTokens.length === 0) return false;

  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((part) =>
      nameTokens.some((token) => nameTokenMatches(token, part))
    );
  }

  return nameTokens.some((token) => nameTokenMatches(token, query));
}
