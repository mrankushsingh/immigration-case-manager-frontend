import { useCallback, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { api } from '../utils/api';
import { Appointment, AppointmentColor } from '../types';
import { showToast } from './Toast';
import {
  APPOINTMENT_COLORS,
  APPOINTMENT_COLOR_BG,
  APPOINTMENT_COLOR_DOT,
  APPOINTMENT_COLOR_LABELS,
  APPOINTMENT_COLOR_RING,
  appointmentLocalDateKey,
  formatAppointmentTime,
  toLocalDatetimeInput,
} from '../utils/appointmentColors';
import { formatReminderFullName } from '../utils/reminderNames';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const startPad = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const EMPTY_FORM = {
  title: '',
  client_name: '',
  client_surname: '',
  phone: '',
  email: '',
  appointment_date: '',
  duration_minutes: '30',
  color: 'blue' as AppointmentColor,
  notes: '',
};

interface AppointmentsCalendarProps {
  animationDelay?: string;
}

export default function AppointmentsCalendar({ animationDelay = '1.1s' }: AppointmentsCalendarProps) {
  const { appointments, refreshAppointments } = useData();
  const [showModal, setShowModal] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeColors, setActiveColors] = useState<Record<AppointmentColor, boolean>>({
    red: true,
    blue: true,
    green: true,
    yellow: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => activeColors[a.color]),
    [appointments, activeColors]
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of filteredAppointments) {
      const key = appointmentLocalDateKey(appt.appointment_date);
      if (!key) continue;
      const list = map.get(key);
      if (list) list.push(appt);
      else map.set(key, [appt]);
    }
    return map;
  }, [filteredAppointments]);

  const previewCells = useMemo(
    () => buildCalendarCells(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const modalCells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const monthAppointmentCount = useMemo(
    () =>
      filteredAppointments.filter((a) => {
        const d = new Date(a.appointment_date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      }).length,
    [filteredAppointments, currentMonth, currentYear]
  );

  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    return appointmentsByDate.get(key) || [];
  }, [selectedDay, viewMonth, viewYear, appointmentsByDate]);

  const openModal = useCallback(() => {
    const today = new Date();
    setViewMonth(today.getMonth() + 1);
    setViewYear(today.getFullYear());
    setSelectedDay(today.getDate());
    setShowForm(false);
    setEditing(null);
    setShowModal(true);
  }, []);

  const toggleColor = (color: AppointmentColor) => {
    setActiveColors((prev) => ({ ...prev, [color]: !prev[color] }));
  };

  const openCreateForm = () => {
    const baseDate = selectedDay
      ? `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}T09:00`
      : toLocalDatetimeInput(new Date().toISOString());
    setEditing(null);
    setForm({ ...EMPTY_FORM, appointment_date: baseDate });
    setShowForm(true);
  };

  const openEditForm = (appt: Appointment) => {
    setEditing(appt);
    setForm({
      title: appt.title,
      client_name: appt.client_name,
      client_surname: appt.client_surname || '',
      phone: appt.phone || '',
      email: appt.email || '',
      appointment_date: toLocalDatetimeInput(appt.appointment_date),
      duration_minutes: String(appt.duration_minutes || 30),
      color: appt.color,
      notes: appt.notes || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.client_name.trim() || !form.appointment_date) {
      showToast('Title, client name, and date/time are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        client_name: form.client_name.trim(),
        client_surname: form.client_surname.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        appointment_date: new Date(form.appointment_date).toISOString(),
        duration_minutes: Number(form.duration_minutes) || 30,
        color: form.color,
        notes: form.notes.trim() || undefined,
      };
      if (editing) {
        await api.updateAppointment(editing.id, payload);
        showToast('Appointment updated', 'success');
      } else {
        await api.createAppointment(payload);
        showToast('Appointment created', 'success');
      }
      await refreshAppointments();
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (error: any) {
      showToast(error.message || 'Failed to save appointment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (appt: Appointment) => {
    if (!window.confirm(`Delete appointment "${appt.title}"?`)) return;
    try {
      await api.deleteAppointment(appt.id);
      await refreshAppointments();
      showToast('Appointment deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete appointment', 'error');
    }
  };

  const renderDayDots = (dayAppointments: Appointment[]) => {
    const colors = [...new Set(dayAppointments.map((a) => a.color))].slice(0, 4);
    return (
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
        {colors.map((color) => (
          <span key={color} className={`w-1 h-1 rounded-full ${APPOINTMENT_COLOR_DOT[color]}`} />
        ))}
      </div>
    );
  };

  const colorFilters = (
    <div className="flex flex-wrap gap-2">
      {APPOINTMENT_COLORS.map((color) => (
        <label
          key={color}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
            activeColors[color]
              ? APPOINTMENT_COLOR_BG[color]
              : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={activeColors[color]}
            onChange={() => toggleColor(color)}
          />
          <span className={`w-2.5 h-2.5 rounded-full ${APPOINTMENT_COLOR_DOT[color]}`} />
          {APPOINTMENT_COLOR_LABELS[color]}
        </label>
      ))}
    </div>
  );

  return (
    <>
      <div
        onClick={openModal}
        className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
        style={{ animationDelay }}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">
            Appointments
          </span>
        </div>
        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-2">
          {monthAppointmentCount}
        </p>
        <p className="text-[10px] sm:text-xs text-amber-700/80 font-medium mb-2">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <div className="mb-2">{colorFilters}</div>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-[8px] sm:text-[9px] text-center text-amber-600/80 font-semibold">
              {day.charAt(0)}
            </div>
          ))}
          {previewCells.map((day, index) => {
            if (!day) return <div key={`appt-empty-${index}`} className="aspect-square" />;
            const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAppts = appointmentsByDate.get(key) || [];
            const isToday = day === now.getDate();
            return (
              <div
                key={key}
                className={`aspect-square flex items-center justify-center rounded-md text-[9px] sm:text-[10px] font-medium relative ${
                  isToday ? 'bg-amber-500 text-white' : dayAppts.length ? 'bg-amber-50 text-amber-900' : 'text-amber-800/70'
                }`}
              >
                {day}
                {dayAppts.length > 0 && renderDayDots(dayAppts)}
              </div>
            );
          })}
        </div>
        <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed">
          Client appointments — tap to manage
        </p>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col m-2 sm:m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">Appointments</h2>
                  <p className="text-amber-700 mt-1">Schedule and manage client appointments</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="mt-4">{colorFilters}</div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 1) {
                      setViewMonth(12);
                      setViewYear(viewYear - 1);
                    } else setViewMonth(viewMonth - 1);
                    setSelectedDay(null);
                  }}
                  className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-lg font-semibold text-amber-900 min-w-[180px] text-center">
                  {new Date(viewYear, viewMonth - 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 12) {
                      setViewMonth(1);
                      setViewYear(viewYear + 1);
                    } else setViewMonth(viewMonth + 1);
                    setSelectedDay(null);
                  }}
                  className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {showForm && (
                <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">
                    {editing ? 'Edit appointment' : 'New appointment'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <input
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Client first name"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    />
                    <input
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Client surname"
                      value={form.client_surname}
                      onChange={(e) => setForm({ ...form, client_surname: e.target.value })}
                    />
                    <input
                      type="datetime-local"
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      value={form.appointment_date}
                      onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                    />
                    <input
                      type="number"
                      min={5}
                      max={480}
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Duration (minutes)"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                    />
                    <select
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value as AppointmentColor })}
                    >
                      {APPOINTMENT_COLORS.map((color) => (
                        <option key={color} value={color}>
                          {APPOINTMENT_COLOR_LABELS[color]}
                        </option>
                      ))}
                    </select>
                    <input
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <input
                      className="px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <textarea
                      className="sm:col-span-2 px-3 py-2 border border-amber-200 rounded-lg"
                      placeholder="Notes"
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSave}
                      className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditing(null);
                        setForm(EMPTY_FORM);
                      }}
                      className="px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-amber-700/80 py-1">
                    {day}
                  </div>
                ))}
                {modalCells.map((day, index) => {
                  if (!day) return <div key={`modal-appt-empty-${index}`} className="aspect-square" />;
                  const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayAppts = appointmentsByDate.get(key) || [];
                  const isSelected = selectedDay === day;
                  const isToday =
                    day === now.getDate() && viewMonth === currentMonth && viewYear === currentYear;
                  const primaryColor = dayAppts[0]?.color;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors relative ${
                        isSelected
                          ? `bg-amber-600 text-white ring-2 ${primaryColor ? APPOINTMENT_COLOR_RING[primaryColor] : 'ring-amber-400'}`
                          : isToday
                            ? 'bg-amber-500 text-white'
                            : dayAppts.length
                              ? `${APPOINTMENT_COLOR_BG[primaryColor || 'blue']} hover:opacity-90`
                              : 'text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      {day}
                      {dayAppts.length > 0 && !isSelected && renderDayDots(dayAppts)}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-amber-200 pt-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">
                  {selectedDay
                    ? new Date(viewYear, viewMonth - 1, selectedDay).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Select a day'}
                </h3>
                {selectedDay && selectedDayAppointments.length === 0 && (
                  <p className="text-sm text-amber-700/70">No appointments on this date.</p>
                )}
                {selectedDayAppointments.length > 0 && (
                  <ul className="space-y-3">
                    {selectedDayAppointments.map((appt) => (
                      <li
                        key={appt.id}
                        className={`p-4 rounded-xl border ${APPOINTMENT_COLOR_BG[appt.color]}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{appt.title}</p>
                            <p className="text-sm mt-1">
                              {formatReminderFullName(appt.client_name, appt.client_surname)}
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                              {formatAppointmentTime(appt.appointment_date)} · {appt.duration_minutes} min ·{' '}
                              {APPOINTMENT_COLOR_LABELS[appt.color]}
                              {appt.source === 'ai' ? ' · AI' : ''}
                            </p>
                            {appt.phone && <p className="text-sm mt-1">{appt.phone}</p>}
                            {appt.email && <p className="text-sm">{appt.email}</p>}
                            {appt.notes && (
                              <p className="text-sm mt-2 whitespace-pre-wrap opacity-90">{appt.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditForm(appt)}
                              className="p-2 rounded-lg hover:bg-white/60"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(appt)}
                              className="p-2 rounded-lg hover:bg-white/60 text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
