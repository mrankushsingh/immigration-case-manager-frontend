import type { AppointmentColor } from '../types';

export const APPOINTMENT_COLORS: AppointmentColor[] = ['red', 'blue', 'green', 'yellow'];

export const APPOINTMENT_COLOR_LABELS: Record<AppointmentColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
};

export const APPOINTMENT_COLOR_DOT: Record<AppointmentColor, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
};

export const APPOINTMENT_COLOR_BG: Record<AppointmentColor, string> = {
  red: 'bg-red-100 text-red-900 border-red-300',
  blue: 'bg-blue-100 text-blue-900 border-blue-300',
  green: 'bg-green-100 text-green-900 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-900 border-yellow-300',
};

export const APPOINTMENT_COLOR_RING: Record<AppointmentColor, string> = {
  red: 'ring-red-400',
  blue: 'ring-blue-400',
  green: 'ring-green-400',
  yellow: 'ring-yellow-300',
};

export function appointmentLocalDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatAppointmentTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}
