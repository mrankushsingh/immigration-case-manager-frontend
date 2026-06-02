import type { Reminder } from '../types';

export function formatReminderFullName(client_name?: string, client_surname?: string): string {
  const first = (client_name || '').trim();
  const last = (client_surname || '').trim();
  if (!first && !last) return '';
  if (!last || first === last) return first;
  return `${first} ${last}`.trim();
}

export function splitReminderFullName(fullName: string): { client_name: string; client_surname: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { client_name: '', client_surname: '' };
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) {
    return { client_name: trimmed, client_surname: trimmed };
  }
  const client_name = trimmed.slice(0, spaceIdx).trim();
  const client_surname = trimmed.slice(spaceIdx + 1).trim() || client_name;
  return { client_name, client_surname };
}

export function reminderDisplayName(reminder: Pick<Reminder, 'client_name' | 'client_surname'>): string {
  return formatReminderFullName(reminder.client_name, reminder.client_surname);
}
