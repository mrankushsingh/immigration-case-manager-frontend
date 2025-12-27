import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../utils/api';
import { Client, Reminder as ReminderType } from '../types';

interface Reminder {
  client: Client;
  type: 'reminder' | 'silence_expiring' | 'silence_expired' | 'documents_pending';
  message: string;
  priority: 'high' | 'medium' | 'low';
  daysRemaining?: number;
}

interface Props {
  onClientClick: (client: Client) => void;
  onReminderClick?: () => void; // Optional callback for RECORDATORIO reminder clicks
}

export default function Notifications({ onClientClick, onReminderClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopups, setShowPopups] = useState(true);
  
  // Load read reminders from localStorage on mount (kept for unread count calculation)
  const [readReminders] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('readReminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load read reminders from localStorage:', error);
    }
    return new Set();
  });

  // Load dismissed reminders from localStorage on mount
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dismissedReminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load dismissed reminders from localStorage:', error);
    }
    return new Set();
  });
  
  const [selectedReminder, setSelectedReminder] = useState<ReminderType | null>(null);
  const [showReminderDetails, setShowReminderDetails] = useState(false);

  // Save read reminders to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('readReminders', JSON.stringify(Array.from(readReminders)));
    } catch (error) {
      console.error('Failed to save read reminders to localStorage:', error);
    }
  }, [readReminders]);

  // Save dismissed reminders to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dismissedReminders', JSON.stringify(Array.from(dismissedReminders)));
    } catch (error) {
      console.error('Failed to save dismissed reminders to localStorage:', error);
    }
  }, [dismissedReminders]);

  useEffect(() => {
    loadReminders();
    // Increase interval to 2 minutes to reduce performance impact
    // Use requestIdleCallback if available for better performance
    const interval = setInterval(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          loadReminders();
        }, { timeout: 5000 });
      } else {
        loadReminders();
      }
    }, 120000); // Check every 2 minutes instead of 1 minute
    return () => clearInterval(interval);
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const [clients, recordatorioReminders] = await Promise.all([
        api.getClients(),
        api.getReminders(),
      ]);
      const newReminders: Reminder[] = [];

      clients.forEach((client: Client) => {
        // Check for custom reminder date first (highest priority)
        // Only show if due date hasn't passed (not overdue) AND there's a remaining balance
        if (client.custom_reminder_date) {
          const remainingAmount = (client.payment?.totalFee || 0) - (client.payment?.paidAmount || 0);
          
          // Only show payment reminders if there's a remaining balance
          if (remainingAmount > 0) {
            const reminderDate = new Date(client.custom_reminder_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            reminderDate.setHours(0, 0, 0, 0);
            const daysUntilReminder = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Only show reminder if it's today or in the future (not overdue)
            if (daysUntilReminder >= 0 && daysUntilReminder <= 2) {
              let priority: 'high' | 'medium' | 'low';
              if (daysUntilReminder === 0) {
                priority = 'high';
              } else {
                priority = daysUntilReminder === 1 ? 'medium' : 'low';
              }
              
              const message = daysUntilReminder === 0
                ? `Payment reminder for ${client.first_name} ${client.last_name} is due today (€${remainingAmount.toFixed(2)} remaining)`
                : `Payment reminder for ${client.first_name} ${client.last_name} is in ${daysUntilReminder} day(s) (€${remainingAmount.toFixed(2)} remaining)`;
              
              newReminders.push({
                client,
                type: 'reminder',
                message,
                priority,
                daysRemaining: daysUntilReminder,
              });
            }
          }
        }
        
        // Check for administrative silence expiring/expired
        if (client.submitted_to_immigration && client.application_date) {
          const applicationDate = new Date(client.application_date);
          const silenceDays = client.administrative_silence_days || 60;
          const endDate = new Date(applicationDate);
          endDate.setDate(endDate.getDate() + silenceDays);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysRemaining < 0) {
            newReminders.push({
              client,
              type: 'silence_expired',
              message: `Administrative silence period expired ${Math.abs(daysRemaining)} days ago for ${client.first_name} ${client.last_name}`,
              priority: 'high',
              daysRemaining,
            });
          } else if (daysRemaining <= 7) {
            newReminders.push({
              client,
              type: 'silence_expiring',
              message: `Administrative silence period expiring in ${daysRemaining} days for ${client.first_name} ${client.last_name}`,
              priority: daysRemaining <= 3 ? 'high' : 'medium',
              daysRemaining,
            });
          }
        }

        // Check for reminder interval based on document activity
        // Only show reminder if client has pending REQUIRED documents and hasn't been submitted
        if (!client.submitted_to_immigration) {
          // Only count required (non-optional) documents
          const pendingRequiredDocs = client.required_documents?.filter((d: any) => !d.submitted && !d.isOptional).length || 0;
          
          if (pendingRequiredDocs > 0) {
            // Find the most recent activity date (document upload or client creation)
            const submittedDocs = client.required_documents?.filter((d: any) => d.submitted && d.uploadedAt) || [];
            let lastActivityDate: Date;
            
            if (submittedDocs.length > 0) {
              // Use the most recent document upload date
              const uploadDates = submittedDocs
                .map((d: any) => new Date(d.uploadedAt))
                .sort((a: Date, b: Date) => b.getTime() - a.getTime());
              lastActivityDate = uploadDates[0];
            } else {
              // If no documents uploaded yet, use client creation date
              lastActivityDate = new Date(client.created_at);
            }

            const reminderDays = client.reminder_interval_days || 10;
            const nextReminderDate = new Date(lastActivityDate);
            nextReminderDate.setDate(nextReminderDate.getDate() + reminderDays);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            nextReminderDate.setHours(0, 0, 0, 0);
            lastActivityDate.setHours(0, 0, 0, 0);
            
            // Calculate days until reminder (negative means overdue)
            const daysUntilReminder = Math.ceil((nextReminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Calculate days since last activity
            const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

            // Show reminder if:
            // 1. Reminder date has passed (overdue), OR
            // 2. Reminder is approaching (within 2 days)
            if (daysUntilReminder <= 2) {
              // Determine priority based on how overdue or approaching
              let priority: 'high' | 'medium' | 'low';
              if (daysUntilReminder < 0) {
                // Overdue
                priority = daysUntilReminder <= -7 ? 'high' : daysUntilReminder <= -3 ? 'medium' : 'low';
              } else {
                // Approaching
                priority = daysUntilReminder === 0 ? 'medium' : 'low';
              }
              
              const message = daysUntilReminder < 0
                ? `${pendingRequiredDocs} required document(s) pending for ${client.first_name} ${client.last_name}. Reminder overdue by ${Math.abs(daysUntilReminder)} day(s). Last activity: ${daysSinceLastActivity} day(s) ago.`
                : daysUntilReminder === 0
                ? `${pendingRequiredDocs} required document(s) pending for ${client.first_name} ${client.last_name}. Reminder due today. Last activity: ${daysSinceLastActivity} day(s) ago.`
                : `${pendingRequiredDocs} required document(s) pending for ${client.first_name} ${client.last_name}. Reminder in ${daysUntilReminder} day(s). Last activity: ${daysSinceLastActivity} day(s) ago.`;
              
              newReminders.push({
                client,
                type: 'reminder',
                message,
                priority,
                daysRemaining: daysUntilReminder, // Negative means overdue, positive means days until
              });
            }
          }
        }
      });

      // Add RECORDATORIO reminders (standalone reminders)
      // Include all reminders including REQUERIMIENTO type
      recordatorioReminders.forEach((reminder: ReminderType) => {
        const reminderDate = new Date(reminder.reminder_date);
        const now = new Date();
        const days3 = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
        const timeDiff = reminderDate.getTime() - now.getTime();
        const daysUntilReminder = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Show reminder if it's within 3 days (urgent) or overdue
        if (timeDiff <= days3) {
          let priority: 'high' | 'medium' | 'low';
          if (timeDiff < 0) {
            // Overdue
            priority = daysUntilReminder <= -7 ? 'high' : daysUntilReminder <= -3 ? 'medium' : 'low';
          } else if (timeDiff <= days3) {
            // Within 3 days (urgent)
            priority = daysUntilReminder === 0 ? 'high' : daysUntilReminder === 1 ? 'high' : 'medium';
          } else {
            // More than 3 days away
            priority = 'low';
          }

          // Only show if within 7 days (past or future)
          if (Math.abs(daysUntilReminder) <= 7) {
            const message = daysUntilReminder < 0
              ? `Reminder for ${reminder.client_name} ${reminder.client_surname} is overdue by ${Math.abs(daysUntilReminder)} day(s)`
              : daysUntilReminder === 0
              ? `Reminder for ${reminder.client_name} ${reminder.client_surname} is due today`
              : `Reminder for ${reminder.client_name} ${reminder.client_surname} is in ${daysUntilReminder} day(s)`;

            // Create a minimal client object for the reminder
            // Use a special prefix to identify RECORDATORIO reminders
            const reminderClient: Client = {
              id: `reminder_${reminder.id}`, // Special prefix to identify RECORDATORIO reminders
              first_name: reminder.client_name,
              last_name: reminder.client_surname,
              phone: reminder.phone,
              email: '',
              required_documents: [],
              reminder_interval_days: 10,
              administrative_silence_days: 60,
              payment: { totalFee: 0, paidAmount: 0, payments: [] },
              submitted_to_immigration: false,
              notifications: [],
              additional_docs_required: false,
              created_at: reminder.created_at,
              updated_at: reminder.updated_at,
            };

            newReminders.push({
              client: reminderClient,
              type: 'reminder',
              message,
              priority,
              daysRemaining: daysUntilReminder,
            });
          }
        }
      });

      // Keep all reminders visible (don't filter out read ones)
      setReminders(newReminders);
      
      // Show pop-ups for high priority reminders (excluding overdue payment reminders)
      // Only show popups for unread reminders
      const highPriorityReminders = newReminders.filter(r => {
        const reminderKey = `${r.client.id}-${r.type}`;
        return !readReminders.has(reminderKey);
      }).filter(r => 
        r.priority === 'high' && 
        !(r.type === 'reminder' && r.daysRemaining !== undefined && r.daysRemaining < 0)
      );
      if (showPopups && highPriorityReminders.length > 0) {
        setTimeout(() => {
          setShowPopups(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter out dismissed reminders
  const visibleReminders = reminders.filter(reminder => {
    const reminderKey = `${reminder.client.id}-${reminder.type}`;
    return !dismissedReminders.has(reminderKey);
  });

  // Count only unread reminders for the badge
  const unreadCount = visibleReminders.filter(reminder => {
    const reminderKey = `${reminder.client.id}-${reminder.type}`;
    return !readReminders.has(reminderKey);
  }).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'silence_expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'silence_expiring':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'documents_pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <>
      {/* Notification Icon */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[85vh] sm:max-h-[600px] overflow-hidden animate-scale-in">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {unreadCount} {unreadCount === 1 ? 'unread reminder' : 'unread reminders'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {visibleReminders.length > 0 && (
                      <button
                        onClick={() => {
                          // Dismiss all visible reminders
                          const allKeys = visibleReminders.map(r => `${r.client.id}-${r.type}`);
                          setDismissedReminders(prev => new Set([...prev, ...allKeys]));
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors flex items-center space-x-1"
                        title="Dismiss all notifications"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-700 mx-auto"></div>
                  </div>
                ) : unreadCount === 0 && visibleReminders.length > 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">All caught up!</p>
                    <p className="text-sm text-slate-400 mt-1">All reminders have been read</p>
                  </div>
                ) : visibleReminders.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">All caught up!</p>
                    <p className="text-sm text-slate-400 mt-1">No reminders at this time</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {visibleReminders.map((reminder, index) => (
                      <div
                        key={`${reminder.client.id}-${reminder.type}-${index}`}
                        onClick={async () => {
                          // Check if it's a RECORDATORIO reminder (standalone reminder)
                          if (reminder.client.id && reminder.client.id.startsWith('reminder_')) {
                            // It's a RECORDATORIO reminder - fetch full reminder details and show modal
                            try {
                              const reminderId = reminder.client.id.replace('reminder_', '');
                              const allReminders = await api.getReminders();
                              const fullReminder = allReminders.find((r: ReminderType) => r.id === reminderId);
                              if (fullReminder) {
                                setSelectedReminder(fullReminder);
                                setShowReminderDetails(true);
                              } else if (onReminderClick) {
                                onReminderClick();
                              }
                            } catch (error) {
                              console.error('Failed to load reminder details:', error);
                              if (onReminderClick) {
                                onReminderClick();
                              }
                            }
                          } else if (reminder.client.id && reminder.client.id.startsWith('client_')) {
                            // It's a real client - open client details
                            onClientClick(reminder.client);
                          }
                          setIsOpen(false);
                        }}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${
                          reminder.priority === 'high'
                            ? 'border-l-red-500'
                            : reminder.priority === 'medium'
                            ? 'border-l-orange-500'
                            : 'border-l-blue-500'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(reminder.priority)}`}>
                            {getIcon(reminder.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {reminder.client.first_name} {reminder.client.last_name}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">{reminder.message}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const reminderKey = `${reminder.client.id}-${reminder.type}`;
                                  setDismissedReminders(prev => new Set([...prev, reminderKey]));
                                }}
                                className="ml-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                                title="Dismiss notification"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {reminder.type === 'reminder' && reminder.daysRemaining !== undefined && (
                              <p className={`text-xs font-medium mt-1 ${
                                reminder.daysRemaining < 0
                                  ? 'text-red-600'
                                  : reminder.daysRemaining === 0
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }`}>
                                {reminder.daysRemaining < 0
                                  ? `⚠️ Overdue by ${Math.abs(reminder.daysRemaining)} day(s)`
                                  : reminder.daysRemaining === 0
                                  ? '⏰ Due today'
                                  : `⏳ Due in ${reminder.daysRemaining} day(s)`}
                              </p>
                            )}
                            {reminder.daysRemaining !== undefined && reminder.type !== 'reminder' && (
                              <p className={`text-xs font-medium mt-1 ${
                                reminder.daysRemaining < 0
                                  ? 'text-red-600'
                                  : reminder.daysRemaining <= 7
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }`}>
                                {reminder.daysRemaining < 0
                                  ? `Expired ${Math.abs(reminder.daysRemaining)} days ago`
                                  : `${reminder.daysRemaining} days remaining`}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {reminder.client.case_type || 'No template'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pop-up Notifications for High Priority (excluding overdue payment reminders) */}
      {showPopups && reminders.filter(r => {
        const reminderKey = `${r.client.id}-${r.type}`;
        return !dismissedReminders.has(reminderKey) &&
          r.priority === 'high' && 
          !(r.type === 'reminder' && r.daysRemaining !== undefined && r.daysRemaining < 0);
      }).length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
          {reminders
            .filter(r => {
              const reminderKey = `${r.client.id}-${r.type}`;
              return !dismissedReminders.has(reminderKey) &&
                r.priority === 'high' && 
                !(r.type === 'reminder' && r.daysRemaining !== undefined && r.daysRemaining < 0);
            })
            .slice(0, 3)
            .map((reminder, index) => (
              <div
                key={`popup-${reminder.client.id}-${reminder.type}-${index}`}
                onClick={async () => {
                  // Check if it's a RECORDATORIO reminder (standalone reminder)
                  if (reminder.client.id && reminder.client.id.startsWith('reminder_')) {
                    // It's a RECORDATORIO reminder - fetch full reminder details and show modal
                    try {
                      const reminderId = reminder.client.id.replace('reminder_', '');
                      const allReminders = await api.getReminders();
                      const fullReminder = allReminders.find((r: ReminderType) => r.id === reminderId);
                      if (fullReminder) {
                        setSelectedReminder(fullReminder);
                        setShowReminderDetails(true);
                      } else if (onReminderClick) {
                        onReminderClick();
                      }
                    } catch (error) {
                      console.error('Failed to load reminder details:', error);
                      if (onReminderClick) {
                        onReminderClick();
                      }
                    }
                  } else if (reminder.client.id && reminder.client.id.startsWith('client_')) {
                    // It's a real client - open client details
                    onClientClick(reminder.client);
                  }
                  setShowPopups(false);
                }}
                className="bg-white rounded-xl shadow-2xl border-2 border-red-200 p-4 animate-slide-up professional-shadow-xl cursor-pointer hover:border-red-300 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    {getIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {reminder.client.first_name} {reminder.client.last_name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const reminderKey = `${reminder.client.id}-${reminder.type}`;
                            setDismissedReminders(prev => new Set([...prev, reminderKey]));
                            setShowPopups(false);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Dismiss notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPopups(false);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">{reminder.message}</p>
                    {reminder.type === 'reminder' && reminder.daysRemaining !== undefined && (
                      <p className={`text-xs font-semibold mt-1 ${
                        reminder.daysRemaining < 0 
                          ? 'text-red-600' 
                          : reminder.daysRemaining === 0
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}>
                        {reminder.daysRemaining < 0
                          ? `⚠️ ${Math.abs(reminder.daysRemaining)} day(s) overdue`
                          : reminder.daysRemaining === 0
                          ? '⏰ Due today'
                          : `⏳ Due in ${reminder.daysRemaining} day(s)`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Reminder Details Modal */}
      {showReminderDetails && selectedReminder && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReminderDetails(false);
              setSelectedReminder(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in shadow-2xl"
            style={{
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                  <Bell className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recordatorio</h3>
                  <p className="text-sm text-gray-600">Detalles del recordatorio</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReminderDetails(false);
                  setSelectedReminder(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                <p className="text-lg font-bold text-gray-900">
                  {selectedReminder.client_name} {selectedReminder.client_surname}
                </p>
              </div>

              {/* Phone */}
              {selectedReminder.phone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                  <p className="text-base text-gray-900">{selectedReminder.phone}</p>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                <p className="text-base text-gray-900">
                  {new Date(selectedReminder.reminder_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Notes */}
              {selectedReminder.notes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notas</label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedReminder.notes}</p>
                  </div>
                </div>
              )}

              {!selectedReminder.notes && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No hay notas adicionales</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowReminderDetails(false);
                  setSelectedReminder(null);
                }}
                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

