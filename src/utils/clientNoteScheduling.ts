import type { Client } from '../types';

const MS_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toISODateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  domingo: 0,
  monday: 1,
  lunes: 1,
  tuesday: 2,
  martes: 2,
  wednesday: 3,
  miercoles: 3,
  miércoles: 3,
  thursday: 4,
  jueves: 4,
  friday: 5,
  viernes: 5,
  saturday: 6,
  sabado: 6,
  sábado: 6,
};

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  enero: 0,
  february: 1,
  feb: 1,
  febrero: 1,
  march: 2,
  mar: 2,
  marzo: 2,
  april: 3,
  apr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  june: 5,
  jun: 5,
  junio: 5,
  july: 6,
  jul: 6,
  julio: 6,
  august: 7,
  aug: 7,
  agosto: 7,
  september: 8,
  sep: 8,
  sept: 8,
  septiembre: 8,
  setiembre: 8,
  october: 9,
  oct: 9,
  octubre: 9,
  november: 10,
  nov: 10,
  noviembre: 10,
  december: 11,
  dec: 11,
  diciembre: 11,
};

function nextWeekday(from: Date, weekday: number): Date {
  const d = startOfDay(from);
  let delta = weekday - d.getDay();
  if (delta <= 0) delta += 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function safeDate(y: number, m: number, day: number): Date | null {
  const d = new Date(y, m, day);
  if (d.getFullYear() !== y || d.getMonth() !== m || d.getDate() !== day) return null;
  return startOfDay(d);
}

/** Parse a follow-up date from free-text notes (EN / ES). */
export function parseDeadlineFromNote(text: string, ref = new Date()): Date | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const today = startOfDay(ref);

  if (/\b(tomorrow|mañana|manana|neser|nesër)\b/i.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }

  if (/\b(today|hoy|sot)\b/i.test(lower)) {
    return today;
  }

  const inDays = lower.match(/\b(?:in|en|dentro de|pas)\s+(\d{1,2})\s+(?:days?|días|dias|ditë|dite)\b/i);
  if (inDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + parseInt(inDays[1], 10));
    return d;
  }

  if (/\b(next week|próxima semana|proxima semana|java e ardhshme)\b/i.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }

  for (const [name, idx] of Object.entries(WEEKDAY_INDEX)) {
    const re = new RegExp(`\\b${name}\\b`, 'i');
    if (re.test(lower)) {
      return nextWeekday(today, idx);
    }
  }

  const iso = raw.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return safeDate(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
  }

  const dmy = raw.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](20\d{2})\b/);
  if (dmy) {
    return safeDate(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
  }

  const monthDayYear = lower.match(
    /\b(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)\s+(20\d{2})\b/i
  );
  if (monthDayYear) {
    const month = MONTH_INDEX[monthDayYear[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '')];
    if (month !== undefined) {
      return safeDate(parseInt(monthDayYear[3], 10), month, parseInt(monthDayYear[1], 10));
    }
  }

  const monthNameDay = lower.match(
    /\b([a-záéíóúñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(20\d{2}))?\b/i
  );
  if (monthNameDay) {
    const monthKey = monthNameDay[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const month = MONTH_INDEX[monthKey];
    if (month !== undefined) {
      const year = monthNameDay[3] ? parseInt(monthNameDay[3], 10) : today.getFullYear();
      return safeDate(year, month, parseInt(monthNameDay[2], 10));
    }
  }

  return null;
}

export function formatImportantNoteDate(d = new Date()): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}-${m}-${y}`;
}

/** Fix dates stored as [6&#x2F;30&#x2F;2026] from older HTML escaping. */
export function decodeHtmlEntities(input: string): string {
  if (!input) return input;
  return input
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

export function normalizeClientNoteText(text: string | undefined | null): string {
  return decodeHtmlEntities(text || '');
}

/** Append a line into Important Notes (deduped, timestamped). */
export function appendImportantNote(existing: string, line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return normalizeClientNoteText(existing);
  const existingNorm = normalizeClientNoteText(existing);
  if (existingNorm.toLowerCase().includes(trimmed.toLowerCase())) return existingNorm;
  const stamp = formatImportantNoteDate();
  return existingNorm.trim()
    ? `${existingNorm.trim()}\n\n[${stamp}] ${trimmed}`
    : `[${stamp}] ${trimmed}`;
}

/** Append any client note into Important Notes (deduped, timestamped). */
export function saveClientNoteToImportantNotes(existingNotes: string, clientNote: string): string {
  return appendImportantNote(existingNotes, clientNote);
}

export function isWithinUrgentWindow(deadline: Date, ref = new Date()): boolean {
  const diff = startOfDay(deadline).getTime() - startOfDay(ref).getTime();
  return diff >= 0 && diff <= 3 * MS_DAY;
}

export function hasUrgentLanguage(text: string): boolean {
  return /\b(urgent|urgente|asap|72\s*h|72h|inmediat|lo antes posible)\b/i.test(text);
}

export interface UrgentReminderPayload {
  client_id: string;
  client_name: string;
  client_surname: string;
  phone?: string;
  reminder_date: string;
  notes: string;
  reminder_type: 'URGENTES';
}

export interface NoteSchedulingPatch {
  notes: string;
  custom_reminder_date?: string;
  urgentReminder?: UrgentReminderPayload;
  followUpDate?: Date;
}

export function buildNoteSchedulingPatch(
  incomingText: string,
  existingNotes: string,
  client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'phone' | 'custom_reminder_date'>,
  mode: 'notes' | 'details'
): NoteSchedulingPatch {
  const trimmed = incomingText.trim();
  let notes = mode === 'notes' ? incomingText : existingNotes;

  if (mode === 'details' && trimmed) {
    notes = appendImportantNote(existingNotes, trimmed);
  }

  const deadline = parseDeadlineFromNote(trimmed);
  if (!deadline) {
    return { notes };
  }

  const isoDate = toISODateOnly(deadline);
  const patch: NoteSchedulingPatch = {
    notes,
    custom_reminder_date: isoDate,
    followUpDate: deadline,
  };

  const shouldCreateUrgentReminder =
    isWithinUrgentWindow(deadline) || hasUrgentLanguage(trimmed);

  if (shouldCreateUrgentReminder) {
    const reminderAt = new Date(deadline);
    reminderAt.setHours(9, 0, 0, 0);
    patch.urgentReminder = {
      client_id: client.id,
      client_name: client.first_name,
      client_surname: client.last_name,
      phone: client.phone,
      reminder_date: reminderAt.toISOString(),
      notes: trimmed,
      reminder_type: 'URGENTES',
    };
  }

  return patch;
}

/** For dashboard URGENTES: deadline from notes when custom_reminder_date is not set. */
export function getNoteFollowUpDeadline(client: Pick<Client, 'notes' | 'custom_reminder_date'>): Date | null {
  if (client.custom_reminder_date) {
    const d = new Date(client.custom_reminder_date);
    if (!Number.isNaN(d.getTime())) return startOfDay(d);
  }
  if (client.notes?.trim()) {
    return parseDeadlineFromNote(client.notes);
  }
  return null;
}
