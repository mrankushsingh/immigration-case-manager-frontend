import { formatReminderFullName } from './reminderNames';

export function formatClientFullName(
  client: { first_name?: string; last_name?: string } | null | undefined
): string {
  if (!client) return '';
  return formatReminderFullName(client.first_name, client.last_name);
}
