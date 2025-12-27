import { useEffect, useState, useRef } from 'react';
import { FileText, Users, CheckCircle, Clock, Send, X, AlertCircle, AlertTriangle, Gavel, DollarSign, FilePlus, Lock, Unlock, Bell, Plus, Trash2, Edit2, Search, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import { CaseTemplate, Client, Reminder } from '../types';
import ClientDetailsModal from './ClientDetailsModal';
import { t } from '../utils/i18n';
import { showToast } from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface DashboardProps {
  onNavigate?: (view: 'templates' | 'clients') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [returnToRequerimiento, setReturnToRequerimiento] = useState(false);
  const [showReadyToSubmitModal, setShowReadyToSubmitModal] = useState(false);
  const [showAwaitingModal, setShowAwaitingModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [showAportarDocumentacionModal, setShowAportarDocumentacionModal] = useState(false);
  const [showRequerimientoModal, setShowRequerimientoModal] = useState(false);
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [showUrgentesModal, setShowUrgentesModal] = useState(false);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderForm, setReminderForm] = useState({
    client_id: '',
    client_name: '',
    client_surname: '',
    phone: '',
    reminder_date: '',
    notes: '',
  });
  const [showRequerimientoReminderForm, setShowRequerimientoReminderForm] = useState(false);
  const [editingRequerimientoReminder, setEditingRequerimientoReminder] = useState<Reminder | null>(null);
  const [requerimientoReminderForm, setRequerimientoReminderForm] = useState({
    client_name: '',
    client_surname: '',
    phone: '',
    reminder_date: '',
    notes: '',
  });
  const [deleteRequerimientoConfirm, setDeleteRequerimientoConfirm] = useState<{ reminder: Reminder | null; isOpen: boolean }>({
    reminder: null,
    isOpen: false,
  });
  
  // Generic reminder form states for all modals
  const [showAportarReminderForm, setShowAportarReminderForm] = useState(false);
  const [showRecursoReminderForm, setShowRecursoReminderForm] = useState(false);
  const [showUrgentesReminderForm, setShowUrgentesReminderForm] = useState(false);
  const [showPagosReminderForm, setShowPagosReminderForm] = useState(false);
  
  const [editingGenericReminder, setEditingGenericReminder] = useState<Reminder | null>(null);
  const [genericReminderForm, setGenericReminderForm] = useState({
    client_name: '',
    client_surname: '',
    phone: '',
    reminder_date: '',
    notes: '',
  });
  
  const handleCreateGenericReminder = async (reminderType: string) => {
    try {
      if (!genericReminderForm.client_name.trim() || !genericReminderForm.client_surname.trim() || !genericReminderForm.reminder_date) {
        showToast('Nombre, Apellido y Fecha son requeridos', 'error');
        return;
      }

      const reminderDate = new Date(genericReminderForm.reminder_date);
      const reminderData = {
        client_id: '',
        client_name: genericReminderForm.client_name.trim(),
        client_surname: genericReminderForm.client_surname.trim(),
        phone: genericReminderForm.phone.trim() || undefined,
        reminder_date: reminderDate.toISOString(),
        notes: genericReminderForm.notes.trim() || undefined,
        reminder_type: reminderType,
      };

      if (editingGenericReminder) {
        await api.updateReminder(editingGenericReminder.id, reminderData);
        showToast('Recordatorio actualizado exitosamente', 'success');
      } else {
        await api.createReminder(reminderData);
        showToast('Recordatorio creado exitosamente', 'success');
      }
      
      // Reset form
      setGenericReminderForm({
        client_name: '',
        client_surname: '',
        phone: '',
        reminder_date: '',
        notes: '',
      });
      setEditingGenericReminder(null);
      
      // Close form
      setShowAportarReminderForm(false);
      setShowRecursoReminderForm(false);
      setShowUrgentesReminderForm(false);
      setShowPagosReminderForm(false);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al crear recordatorio', 'error');
    }
  };
  
  const renderGenericReminderForm = (isOpen: boolean, onClose: () => void, reminderType: string, title: string) => {
    if (!isOpen) return null;
    
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateGenericReminder(reminderType);
        }}
        className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200"
      >
        <h3 className="text-lg font-semibold text-amber-900 mb-4">
          {editingGenericReminder ? `Editar ${title}` : title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              id="generic-reminder-client-name"
              name="client_name"
              required
              value={genericReminderForm.client_name}
              onChange={(e) => setGenericReminderForm({ ...genericReminderForm, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input
              type="text"
              id="generic-reminder-client-surname"
              name="client_surname"
              required
              value={genericReminderForm.client_surname}
              onChange={(e) => setGenericReminderForm({ ...genericReminderForm, client_surname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Apellido del cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              id="generic-reminder-phone"
              name="phone"
              value={genericReminderForm.phone}
              onChange={(e) => setGenericReminderForm({ ...genericReminderForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Número de teléfono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
            <input
              type="datetime-local"
              id="generic-reminder-date"
              name="reminder_date"
              required
              value={genericReminderForm.reminder_date}
              onChange={(e) => setGenericReminderForm({ ...genericReminderForm, reminder_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              id="generic-reminder-notes"
              name="notes"
              value={genericReminderForm.notes}
              onChange={(e) => setGenericReminderForm({ ...genericReminderForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              rows={3}
              placeholder="Notas adicionales (opcional)"
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              setEditingGenericReminder(null);
              setGenericReminderForm({
                client_name: '',
                client_surname: '',
                phone: '',
                reminder_date: '',
                notes: '',
              });
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    );
  };
  const [paymentsUnlocked, setPaymentsUnlocked] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [, forceUpdate] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    reminder: Reminder | null;
  }>({
    isOpen: false,
    reminder: null,
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    client_name: '',
    client_surname: '',
    phone: '',
    amount_paid: '',
    total_amount: '',
    pending_extra: '',
    notes: '',
    caseTemplateId: '',
  });
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const paymentTemplateDropdownRef = useRef<HTMLDivElement>(null);
  
  // Explicitly reference modal states to satisfy TypeScript
  void showAportarDocumentacionModal;
  void showRequerimientoModal;
  void showRecursoModal;
  void showUrgentesModal;
  void showPagosModal;

  const handlePaymentsClick = () => {
    if (paymentsUnlocked) {
      setShowPagosModal(true);
    } else {
      setShowPasscodeModal(true);
      setPasscodeInput('');
      setPasscodeError('');
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    
    try {
      const result = await api.verifyPaymentPasscode(passcodeInput);
      if (result.valid) {
        setPaymentsUnlocked(true);
        setShowPasscodeModal(false);
        setShowPagosModal(true);
        setPasscodeInput('');
      } else {
        setPasscodeError('Incorrect passcode. Please try again.');
        setPasscodeInput('');
      }
    } catch (error: any) {
      setPasscodeError(error.message || 'Failed to verify passcode. Please try again.');
      setPasscodeInput('');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amountPaid = parseFloat(paymentForm.amount_paid) || 0;
      const totalAmount = parseFloat(paymentForm.total_amount) || 0;
      const pendingExtra = parseFloat(paymentForm.pending_extra) || 0;
      
      // Calculate final amounts
      const finalTotalAmount = totalAmount + pendingExtra;
      
      // Check if client exists (by name and phone)
      const existingClient = clients.find(
        (c) => 
          c.first_name.toLowerCase() === paymentForm.client_name.toLowerCase() &&
          c.last_name.toLowerCase() === paymentForm.client_surname.toLowerCase() &&
          (paymentForm.phone ? c.phone === paymentForm.phone : true)
      );
      
      if (existingClient) {
        // Update existing client's payment
        const currentPaid = existingClient.payment?.paidAmount || 0;
        const newPaidAmount = currentPaid + amountPaid + pendingExtra;
        
        await api.addPayment(
          existingClient.id,
          amountPaid + pendingExtra,
          'Manual Entry',
          paymentForm.notes || undefined
        );
        
        // Update total fee if provided
        if (finalTotalAmount > 0 && finalTotalAmount !== existingClient.payment?.totalFee) {
          await api.updateClient(existingClient.id, {
            payment: {
              ...existingClient.payment,
              totalFee: finalTotalAmount,
              paidAmount: newPaidAmount,
            },
          });
        }
        
        showToast('Payment added successfully', 'success');
      } else {
        // Create new client with payment info
        const newClient = {
          firstName: paymentForm.client_name.trim(),
          lastName: paymentForm.client_surname.trim(),
          phone: paymentForm.phone?.trim() || undefined,
          totalFee: finalTotalAmount,
          caseTemplateId: paymentForm.caseTemplateId || undefined,
        };
        
        const createdClient = await api.createClient(newClient);
        
        // Add the payment to the newly created client
        if (amountPaid + pendingExtra > 0) {
          await api.addPayment(
            createdClient.id,
            amountPaid + pendingExtra,
            'Manual Entry',
            paymentForm.notes || undefined
          );
        }
        
        // Update notes if provided
        if (paymentForm.notes) {
          await api.updateClient(createdClient.id, {
            notes: paymentForm.notes,
          });
        }
        
        showToast('Client and payment created successfully', 'success');
      }
      
      // Reset form
      setPaymentForm({
        client_name: '',
        client_surname: '',
        phone: '',
        amount_paid: '',
        total_amount: '',
        pending_extra: '',
        notes: '',
        caseTemplateId: '',
      });
      setShowTemplateDropdown(false);
      setTemplateSearchQuery('');
      setShowPaymentForm(false);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to add payment', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Listen for language changes to force re-render
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    // Listen for custom event to open RECORDATORIO modal
    const handleOpenRecordatorioModal = () => {
      setShowRecordatorioModal(true);
    };
    window.addEventListener('openRecordatorioModal', handleOpenRecordatorioModal);
    return () => {
      window.removeEventListener('openRecordatorioModal', handleOpenRecordatorioModal);
    };
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, clientsData, remindersData] = await Promise.all([
        api.getCaseTemplates(),
        api.getClients(),
        api.getReminders(),
      ]);
      setTemplates(templatesData);
      setClients(clientsData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const submittedToAdmin = clients.filter((client) => client.submitted_to_immigration);
  // Clients ready to submit (all documents complete, not yet submitted)
  const readyToSubmit = clients.filter((client) => {
    if (client.submitted_to_immigration) return false;
    const requiredDocs = client.required_documents?.filter((d: any) => !d.isOptional) || [];
    return requiredDocs.length > 0 && requiredDocs.every((d: any) => d.submitted);
  });
  // Clients with incomplete documents (pending documentation)
  const awaitingSubmission = clients.filter((client) => {
    if (client.submitted_to_immigration) return false;
    const requiredDocs = client.required_documents?.filter((d: any) => !d.isOptional) || [];
    return requiredDocs.length > 0 && requiredDocs.some((d: any) => !d.submitted);
  });
  
  // APORTAR DOCUMENTACIÓN: Clients that have APORTAR DOCUMENTACIÓN documents that are NOT uploaded (missing files)
  // Only show clients with aportar_documentacion documents that don't have fileUrl
  const aportarDocumentacion = clients.filter((client) => {
    // ONLY check aportar_documentacion field - ignore required_documents completely
    const aportarDocs = client.aportar_documentacion;
    
    // Must have aportar_documentacion array with at least one valid document
    if (!aportarDocs || !Array.isArray(aportarDocs) || aportarDocs.length === 0) {
      return false;
    }
    
    // Verify these are actual APORTAR DOCUMENTACIÓN documents (have id, name, etc.)
    const validDocs = aportarDocs.filter((doc: any) => doc && (doc.id || doc.name));
    if (validDocs.length === 0) {
      return false;
    }
    
    // IMPORTANT: Only show clients that have at least one APORTAR DOCUMENTACIÓN document WITHOUT a file (not uploaded)
    const documentsWithoutFile = validDocs.filter((doc: any) => !doc.fileUrl);
    return documentsWithoutFile.length > 0;
  });

  
  // REQUERIMIENTO: Clients with pending requested documents (submitted clients with pending requested docs)
  const requerimiento = clients.filter((client) => {
    if (!client.submitted_to_immigration) return false;
    const requestedDocs = client.requested_documents || [];
    return requestedDocs.length > 0 && requestedDocs.some((d: any) => !d.submitted);
  });

  // REQUERIMIENTO Reminders: Reminders created from REQUERIMIENTO box
  const requerimientoReminders = reminders.filter((reminder) => reminder.reminder_type === 'REQUERIMIENTO');
  
  // Filter reminders by type for each modal
  const aportarReminders = reminders.filter((reminder) => reminder.reminder_type === 'APORTAR_DOCUMENTACION');
  const recursoReminders = reminders.filter((reminder) => reminder.reminder_type === 'RECURSO');
  const urgentesReminders = reminders.filter((reminder) => reminder.reminder_type === 'URGENTES');
  const pagosReminders = reminders.filter((reminder) => reminder.reminder_type === 'PAGOS');
  
  // RECURSO: Clients that need to file an appeal (placeholder - can be expanded later)
  // For now, this could be clients with expired administrative silence or specific status
  const recurso = clients.filter((client) => {
    if (!client.submitted_to_immigration || !client.application_date) return false;
    // Check if administrative silence has expired (could indicate need for appeal)
    const appDate = new Date(client.application_date);
    const silenceDays = client.administrative_silence_days || 60;
    const silenceEndDate = new Date(appDate);
    silenceEndDate.setDate(silenceEndDate.getDate() + silenceDays);
    const now = new Date();
    // If silence period has expired, might need appeal
    return now > silenceEndDate;
  });
  
  // URGENTES: Clients with urgent deadlines within 3 days (72 hours)
  const urgentes = clients.filter((client) => {
    const now = new Date();
    const days3 = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    
    // Check custom reminder date
    if (client.custom_reminder_date) {
      const reminderDate = new Date(client.custom_reminder_date);
      const timeDiff = reminderDate.getTime() - now.getTime();
      if (timeDiff > 0 && timeDiff <= days3) return true;
    }
    
    // Check requested documents deadline
    if (client.submitted_to_immigration && client.requested_documents) {
      const requestedDocs = client.requested_documents || [];
      const pendingDocs = requestedDocs.filter((d: any) => !d.submitted);
      if (pendingDocs.length > 0) {
        const durationDays = client.requested_documents_reminder_duration_days || 10;
        const lastRequestDate = pendingDocs[0]?.requestedAt 
          ? new Date(pendingDocs[0].requestedAt)
          : client.application_date 
            ? new Date(client.application_date)
            : null;
        if (lastRequestDate) {
          const deadline = new Date(lastRequestDate);
          deadline.setDate(deadline.getDate() + durationDays);
          const timeDiff = deadline.getTime() - now.getTime();
          if (timeDiff > 0 && timeDiff <= days3) return true;
        }
      }
    }
    
    // Check administrative silence expiring soon
    if (client.submitted_to_immigration && client.application_date) {
      const appDate = new Date(client.application_date);
      const silenceDays = client.administrative_silence_days || 60;
      const silenceEndDate = new Date(appDate);
      silenceEndDate.setDate(silenceEndDate.getDate() + silenceDays);
      const timeDiff = silenceEndDate.getTime() - now.getTime();
      if (timeDiff > 0 && timeDiff <= days3) return true;
    }
    
    return false;
  });

  // Also add reminders that are within 3 days to urgent list
  // Include all reminders including REQUERIMIENTO type
  const urgentReminders = reminders.filter((reminder) => {
    const now = new Date();
    const reminderDate = new Date(reminder.reminder_date);
    const days3 = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    const timeDiff = reminderDate.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= days3;
  });

  // PAGOS: Clients with pending payments or advance payments
  const pagos = clients.filter((client) => {
    const totalFee = client.payment?.totalFee || 0;
    const paidAmount = client.payment?.paidAmount || 0;
    // Include clients with pending payments (totalFee > paidAmount) or advance payments (paidAmount > totalFee)
    return totalFee !== paidAmount;
  });

  // Calculate payment statistics for color indicators
  const paymentStats = pagos.reduce((acc, client) => {
    const totalFee = client.payment?.totalFee || 0;
    const paidAmount = client.payment?.paidAmount || 0;
    const remaining = totalFee - paidAmount;
    if (remaining < 0) {
      acc.advance++;
    } else if (remaining > 0) {
      acc.pending++;
    }
    return acc;
  }, { advance: 0, pending: 0 });

  // Calculate overall payment statistics (all clients)
  const overallPaymentStats = clients.reduce((acc, client) => {
    const totalFee = client.payment?.totalFee || 0;
    const paidAmount = client.payment?.paidAmount || 0;
    const remaining = totalFee - paidAmount;
    if (remaining < 0) {
      acc.totalAdvance += Math.abs(remaining);
      acc.advanceCount++;
    } else if (remaining > 0) {
      acc.totalDue += remaining;
      acc.dueCount++;
    } else {
      acc.noDueCount++;
    }
    return acc;
  }, { totalDue: 0, totalAdvance: 0, dueCount: 0, advanceCount: 0, noDueCount: 0 });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-amber-200/50 pb-4 sm:pb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2 tracking-tight">
          {t('dashboard.title')}
        </h2>
        <p className="text-amber-700/80 text-base sm:text-lg font-medium">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div 
          onClick={() => onNavigate?.('templates')}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.templates')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{templates.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed">{t('dashboard.activeTemplates')}</p>
        </div>

        <div 
          onClick={() => onNavigate?.('clients')}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.clients')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{clients.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed">{t('dashboard.totalClients')}</p>
        </div>

        <div 
          onClick={() => setShowAwaitingModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.pending')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{awaitingSubmission.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.awaitingSubmission')}</p>
        </div>

        <div 
          onClick={() => setShowReadyToSubmitModal(true)}
          className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl border-2 border-green-400 active:scale-95"
          style={{ 
            animationDelay: '0.3s',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.2) 50%, rgba(34, 197, 94, 0.15) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-200 to-green-300 p-3 rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-green-900" />
            </div>
            <span className="text-xs font-semibold text-green-800 uppercase tracking-wider">{t('dashboard.readyToSubmit')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent mb-1 sm:mb-2">{readyToSubmit.length}</p>
          <p className="text-xs sm:text-sm text-green-800 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.readyToSubmitDesc')}</p>
        </div>

        <div 
          onClick={() => setShowSubmittedModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <Send className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.administrative')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{submittedToAdmin.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">
            {submittedToAdmin.length === 1 ? t('dashboard.caseSubmitted') : t('dashboard.casesSubmitted')}
          </p>
        </div>

        {/* APORTAR DOCUMENTACIÓN Box */}
        <div 
          onClick={() => setShowAportarDocumentacionModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <FilePlus className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.aportarDocumentacion')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{aportarDocumentacion.length + aportarReminders.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.aportarDocumentacionDesc')}</p>
        </div>

        {/* REQUERIMIENTO Box */}
        <div 
          onClick={() => setShowRequerimientoModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <AlertCircle className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.requerimiento')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{requerimiento.length + requerimientoReminders.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.requerimientoDesc')}</p>
        </div>

        {/* RECURSO Box */}
        <div 
          onClick={() => setShowRecursoModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <Gavel className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.recurso')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{recurso.length + recursoReminders.length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.recursoDesc')}</p>
        </div>

        {/* URGENTES Box */}
        <div 
          onClick={() => setShowUrgentesModal(true)}
          className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl border-2 border-red-500 active:scale-95"
          style={{ 
            animationDelay: '0.8s',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 50%, rgba(239, 68, 68, 0.15) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-red-300 to-red-400 p-3 rounded-xl shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-950" />
            </div>
            <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">{t('dashboard.urgentes')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-950 to-red-800 bg-clip-text text-transparent mb-1 sm:mb-2">{urgentes.length + urgentReminders.length + urgentesReminders.length}</p>
          <p className="text-xs sm:text-sm text-red-900 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.urgentesDesc')}</p>
        </div>

        {/* RECORDATORIO Box */}
        <div 
          onClick={() => setShowRecordatorioModal(true)}
          className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl active:scale-95"
          style={{ animationDelay: '0.9s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <Bell className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.recordatorio')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">{reminders.filter((r) => r.reminder_type !== 'REQUERIMIENTO').length}</p>
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">{t('dashboard.recordatorioDesc')}</p>
        </div>

        {/* PAGOS Box */}
        <div 
          onClick={handlePaymentsClick}
          className="glass-gold rounded-2xl p-5 sm:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl relative"
          style={{ animationDelay: '0.8s' }}
        >
          {!paymentsUnlocked && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Locked</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              {paymentsUnlocked ? (
                <Unlock className="w-6 h-6 text-amber-800" />
              ) : (
                <Lock className="w-6 h-6 text-amber-800" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700/70 uppercase tracking-wider">{t('dashboard.pagos')}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            {paymentsUnlocked ? pagos.length + pagosReminders.length : '🔒'}
          </p>
          {paymentsUnlocked && pagos.length > 0 && (
            <div className="flex items-center gap-3 mb-2">
              {paymentStats.pending > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-amber-700 font-medium">
                    {paymentStats.pending} Pending
                  </span>
                </div>
              )}
              {paymentStats.advance > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-700 font-medium">
                    {paymentStats.advance} Advance
                  </span>
                </div>
              )}
            </div>
          )}
          <p className="text-xs sm:text-sm text-amber-700/70 font-medium leading-relaxed mb-1 sm:mb-2">
            {paymentsUnlocked ? t('dashboard.pagosDesc') : 'Enter passcode to view'}
          </p>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent">{t('dashboard.recentClients')}</h3>
            <p className="text-xs sm:text-sm text-amber-700/70 mt-1 font-medium">{t('dashboard.latestActivity')}</p>
          </div>
        </div>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-700/80 font-medium">{t('dashboard.noClients')}</p>
            <p className="text-sm text-amber-600/70 mt-1">{t('dashboard.createFirstClient')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 glass rounded-xl glass-hover group cursor-pointer gap-3 sm:gap-0"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-gradient-to-br from-amber-200 to-amber-300 group-hover:from-amber-300 group-hover:to-amber-400 p-2.5 rounded-lg transition-colors shadow-md">
                    <Users className="w-5 h-5 text-amber-800" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 text-lg group-hover:text-amber-800 transition-colors">
                      {client.first_name} {client.last_name}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-amber-700/80 font-medium">{client.case_type || 'No template assigned'}</p>
                          {(() => {
                            // Calculate reminder status
                            const calculateReminderStatus = () => {
                              if (client.submitted_to_immigration) return null;
                              
                              const pendingRequiredDocs = client.required_documents?.filter((d: any) => !d.submitted && !d.isOptional).length || 0;
                              if (pendingRequiredDocs === 0) return null;
                              
                              // Find last activity date
                              // If no documents uploaded, reminder starts from client creation date
                              // If documents uploaded, reminder starts from most recent upload date
                              const submittedDocs = client.required_documents?.filter((d: any) => d.submitted && d.uploadedAt) || [];
                              let lastActivityDate: Date;
                              let hasNoUploads = false;
                              
                              if (submittedDocs.length > 0) {
                                const uploadDates = submittedDocs
                                  .map((d: any) => new Date(d.uploadedAt))
                                  .sort((a: Date, b: Date) => b.getTime() - a.getTime());
                                lastActivityDate = uploadDates[0];
                              } else {
                                // No documents uploaded yet - reminder starts from client creation
                                lastActivityDate = new Date(client.created_at);
                                hasNoUploads = true;
                              }
                              
                              const reminderDays = client.reminder_interval_days || 10;
                              const nextReminderDate = new Date(lastActivityDate);
                              nextReminderDate.setDate(nextReminderDate.getDate() + reminderDays);
                              
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              nextReminderDate.setHours(0, 0, 0, 0);
                              
                              const daysUntilReminder = Math.ceil((nextReminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return {
                                daysUntilReminder,
                                isOverdue: daysUntilReminder < 0,
                                isDueSoon: daysUntilReminder <= 2 && daysUntilReminder >= 0,
                                hasNoUploads, // Track if no documents uploaded yet
                              };
                            };
                            
                            const reminderStatus = calculateReminderStatus();
                            
                            if (!reminderStatus) {
                              return (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">
                                    {t('dashboard.interval')}: {client.reminder_interval_days} {t('dashboard.days')}
                        </p>
                      </div>
                              );
                            }
                            
                            const { daysUntilReminder, isOverdue, isDueSoon, hasNoUploads } = reminderStatus;
                            
                            return (
                              <div className="flex items-center space-x-1">
                                <Clock className={`w-3.5 h-3.5 ${
                                  isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-slate-400'
                                }`} />
                                <p className={`text-xs font-medium ${
                                  isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-500'
                                }`}>
                                  {isOverdue 
                                    ? `${t('dashboard.overdue')} ${Math.abs(daysUntilReminder)} ${t('dashboard.days')}${hasNoUploads ? ` ${t('dashboard.noDocs')}` : ''}`
                                    : daysUntilReminder === 0
                                    ? t('dashboard.dueToday')
                                    : `${t('dashboard.dueIn')} ${daysUntilReminder} ${t('dashboard.days')}${hasNoUploads ? ` ${t('dashboard.noDocs')}` : ''}`
                                  }
                                </p>
                              </div>
                            );
                          })()}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="inline-flex items-center space-x-2 bg-white px-3 sm:px-4 py-2 rounded-lg border border-amber-200 shadow-md">
                    <span className="text-base sm:text-lg font-bold text-amber-800">
                      {client.required_documents?.filter((d: any) => d.submitted).length || 0}
                    </span>
                    <span className="text-amber-400">/</span>
                    <span className="text-base sm:text-lg font-semibold text-amber-700">
                      {client.required_documents?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600/70 mt-1 font-medium">{t('dashboard.documents')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* APORTAR DOCUMENTACIÓN Modal */}
      {showAportarDocumentacionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{t('dashboard.aportarDocumentacion')}</h2>
                  <p className="text-amber-700 mt-1">{t('dashboard.aportarDocumentacionDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
            onClick={() => {
              setShowAportarReminderForm(!showAportarReminderForm);
              setEditingGenericReminder(null);
              if (!showAportarReminderForm) {
                setGenericReminderForm({
                  client_name: '',
                  client_surname: '',
                  phone: '',
                  reminder_date: '',
                  notes: '',
                });
              }
            }}
                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Nuevo Recordatorio"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAportarDocumentacionModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderGenericReminderForm(showAportarReminderForm, () => setShowAportarReminderForm(false), 'APORTAR_DOCUMENTACION', 'Nuevo Recordatorio')}
              
              {/* APORTAR_DOCUMENTACION Reminders */}
              {aportarReminders.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-3">
                    {aportarReminders.map((reminder) => {
                      const reminderDate = new Date(reminder.reminder_date);
                      const hasClientId = reminder.client_id && reminder.client_id.trim() !== '';
                      return (
                        <div
                          key={reminder.id}
                          onClick={async () => {
                            if (hasClientId) {
                              try {
                                const client = await api.getClient(reminder.client_id!);
                                if (client) {
                                  // Don't set returnToAportarDocumentacion - just open client details
                                  // User can manually reopen modal if needed
                                  setSelectedClient(client);
                                  setShowAportarDocumentacionModal(false);
                                }
                              } catch (error) {
                                console.error('Error loading client:', error);
                                showToast('Error al cargar el cliente', 'error');
                              }
                            }
                          }}
                          className={`p-4 border-2 border-amber-300 rounded-xl bg-gradient-to-br from-amber-100 to-white ${hasClientId ? 'cursor-pointer hover:border-amber-400 hover:shadow-md transition-all' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">APORTAR DOCUMENTACIÓN</span>
                                <h3 className="font-bold text-amber-900 text-lg">{reminder.client_name} {reminder.client_surname}</h3>
                              </div>
                              {reminder.phone && (
                                <p className="text-sm text-amber-700 mt-1">Teléfono: {reminder.phone}</p>
                              )}
                              <p className="text-xs text-amber-600 mt-2">
                                Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {reminder.notes && (
                                <p className="text-xs text-amber-600 mt-1">Notas: {reminder.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const dateStr = reminder.reminder_date;
                                  const date = new Date(dateStr);
                                  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                  const formattedDate = localDate.toISOString().slice(0, 16);
                                  setEditingGenericReminder(reminder);
                                  setGenericReminderForm({
                                    client_name: reminder.client_name || '',
                                    client_surname: reminder.client_surname || '',
                                    phone: reminder.phone || '',
                                    reminder_date: formattedDate,
                                    notes: reminder.notes || '',
                                  });
                                  setShowAportarReminderForm(true);
                                }}
                                className="p-2 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRequerimientoConfirm({ reminder, isOpen: true });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {aportarDocumentacion.length === 0 && aportarReminders.length === 0 && !showAportarReminderForm ? (
                <div className="text-center py-12">
                  <FilePlus className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">{t('dashboard.allSubmitted')}</p>
                  <p className="text-sm text-gray-400 mt-1">No hay documentos en APORTAR DOCUMENTACIÓN</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aportarDocumentacion.length > 0 && (
                    <h3 className="text-lg font-semibold text-amber-900 mb-3">Clientes con Documentos en APORTAR DOCUMENTACIÓN</h3>
                  )}
                  {aportarDocumentacion.map((client) => {
                    const aportarDocs = client.aportar_documentacion || [];
                    const missingFileDocs = aportarDocs.filter((d: any) => !d.fileUrl);
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          // Don't set returnToAportarDocumentacion - just open client details
                          // User can manually reopen modal if needed
                          setSelectedClient(client);
                          setShowAportarDocumentacionModal(false);
                        }}
                        className="p-4 border-2 border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-900 text-lg">{client.first_name} {client.last_name}</h3>
                            <p className="text-sm text-amber-700 mt-1">{client.case_type || 'No template'}</p>
                            <p className="text-xs text-amber-600 mt-2">
                              {aportarDocs.length} documento(s) en APORTAR DOCUMENTACIÓN
                              {missingFileDocs.length > 0 && ` (${missingFileDocs.length} sin archivo)`}
                            </p>
                          </div>
                          <FilePlus className="w-6 h-6 text-amber-600 ml-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REQUERIMIENTO Modal */}
      {showRequerimientoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{t('dashboard.requerimiento')}</h2>
                  <p className="text-amber-700 mt-1">{t('dashboard.requerimientoDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowRequerimientoReminderForm(!showRequerimientoReminderForm);
                      if (!showRequerimientoReminderForm) {
                        setEditingRequerimientoReminder(null);
                        setRequerimientoReminderForm({
                          client_name: '',
                          client_surname: '',
                          phone: '',
                          reminder_date: '',
                          notes: '',
                        });
                      }
                    }}
                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Nuevo REQUERIMIENTO"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowRequerimientoModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">

              {/* Nuevo Recordatorio Form */}
              {showRequerimientoReminderForm && (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      if (!requerimientoReminderForm.client_name.trim() || !requerimientoReminderForm.client_surname.trim() || !requerimientoReminderForm.reminder_date) {
                        showToast('Nombre, Apellido y Fecha y Hora del Recordatorio son requeridos', 'error');
                        return;
                      }

                      const reminderDate = new Date(requerimientoReminderForm.reminder_date);
                      const reminderData = {
                        client_id: '', // Optional for standalone reminders
                        client_name: requerimientoReminderForm.client_name.trim(),
                        client_surname: requerimientoReminderForm.client_surname.trim(),
                        phone: requerimientoReminderForm.phone.trim() || undefined,
                        reminder_date: reminderDate.toISOString(),
                        notes: requerimientoReminderForm.notes.trim() || undefined,
                        reminder_type: 'REQUERIMIENTO', // Mark as REQUERIMIENTO reminder
                      };

                      if (editingRequerimientoReminder) {
                        await api.updateReminder(editingRequerimientoReminder.id, reminderData);
                        showToast('Recordatorio actualizado exitosamente', 'success');
                      } else {
                        await api.createReminder(reminderData);
                        showToast('Recordatorio creado exitosamente', 'success');
                      }
                      
                      // Reset form
                      setRequerimientoReminderForm({
                        client_name: '',
                        client_surname: '',
                        phone: '',
                        reminder_date: '',
                        notes: '',
                      });
                      setEditingRequerimientoReminder(null);
                      setShowRequerimientoReminderForm(false);
                      
                      // Reload data
                      await loadData();
                    } catch (error: any) {
                      showToast(error.message || 'Error al crear recordatorio', 'error');
                    }
                  }}
                  className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    {editingRequerimientoReminder ? 'Editar REQUERIMIENTO' : 'Nuevo REQUERIMIENTO'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        id="requerimiento-reminder-client-name"
                        name="client_name"
                        required
                        value={requerimientoReminderForm.client_name}
                        onChange={(e) => setRequerimientoReminderForm({ ...requerimientoReminderForm, client_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                      <input
                        type="text"
                        id="requerimiento-reminder-client-surname"
                        name="client_surname"
                        required
                        value={requerimientoReminderForm.client_surname}
                        onChange={(e) => setRequerimientoReminderForm({ ...requerimientoReminderForm, client_surname: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="Apellido del cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        id="requerimiento-reminder-phone"
                        name="phone"
                        value={requerimientoReminderForm.phone}
                        onChange={(e) => setRequerimientoReminderForm({ ...requerimientoReminderForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="Número de teléfono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora del Recordatorio *</label>
                      <input
                        type="datetime-local"
                        id="requerimiento-reminder-date"
                        name="reminder_date"
                        required
                        value={requerimientoReminderForm.reminder_date}
                        onChange={(e) => setRequerimientoReminderForm({ ...requerimientoReminderForm, reminder_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="mm/dd/yyyy --:-- --"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                      <textarea
                        id="requerimiento-reminder-notes"
                        name="notes"
                        value={requerimientoReminderForm.notes}
                        onChange={(e) => setRequerimientoReminderForm({ ...requerimientoReminderForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        rows={3}
                        placeholder="Notas adicionales (opcional)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequerimientoReminderForm(false);
                        setEditingRequerimientoReminder(null);
                        setRequerimientoReminderForm({
                          client_name: '',
                          client_surname: '',
                          phone: '',
                          reminder_date: '',
                          notes: '',
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {/* REQUERIMIENTO Reminders */}
              {requerimientoReminders.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-3">
                    {requerimientoReminders.map((reminder) => {
                      const reminderDate = new Date(reminder.reminder_date);
                      return (
                        <div
                          key={reminder.id}
                          className="p-4 border-2 border-amber-300 rounded-xl hover:border-amber-400 hover:shadow-md transition-all bg-gradient-to-br from-amber-100 to-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">REQUERIMIENTO</span>
                                <h3 className="font-bold text-amber-900 text-lg">{reminder.client_name} {reminder.client_surname}</h3>
                              </div>
                              {reminder.phone && (
                                <p className="text-sm text-amber-700 mt-1">Teléfono: {reminder.phone}</p>
                              )}
                              <p className="text-xs text-amber-600 mt-2">
                                Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {reminder.notes && (
                                <p className="text-xs text-amber-600 mt-1">Notas: {reminder.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRequerimientoReminder(reminder);
                                  const dateStr = reminder.reminder_date;
                                  const date = new Date(dateStr);
                                  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                  const formattedDate = localDate.toISOString().slice(0, 16);
                                  setRequerimientoReminderForm({
                                    client_name: reminder.client_name || '',
                                    client_surname: reminder.client_surname || '',
                                    phone: reminder.phone || '',
                                    reminder_date: formattedDate,
                                    notes: reminder.notes || '',
                                  });
                                  setShowRequerimientoReminderForm(true);
                                }}
                                className="p-2 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRequerimientoConfirm({ reminder, isOpen: true });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REQUERIMIENTO Clients */}
              {requerimiento.length === 0 && requerimientoReminders.length === 0 && !showRequerimientoReminderForm ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">{t('dashboard.allSubmitted')}</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los documentos solicitados han sido proporcionados</p>
                </div>
              ) : requerimiento.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Clientes con Documentos Pendientes</h3>
                  {requerimiento.map((client) => {
                    const pendingDocs = (client.requested_documents || []).filter((d: any) => !d.submitted);
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          setReturnToRequerimiento(true);
                          setSelectedClient(client);
                          setShowRequerimientoModal(false);
                        }}
                        className="p-4 border-2 border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-900 text-lg">{client.first_name} {client.last_name}</h3>
                            <p className="text-sm text-amber-700 mt-1">{client.case_type || 'No template'}</p>
                            <p className="text-xs text-amber-600 mt-2">
                              {pendingDocs.length} documento(s) pendiente(s): {pendingDocs.map((d: any) => d.name).join(', ')}
                            </p>
                          </div>
                          <AlertCircle className="w-6 h-6 text-amber-600 ml-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* RECURSO Modal */}
      {showRecursoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{t('dashboard.recurso')}</h2>
                  <p className="text-amber-700 mt-1">{t('dashboard.recursoDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
            onClick={() => {
              setShowRecursoReminderForm(!showRecursoReminderForm);
              setEditingGenericReminder(null);
              if (!showRecursoReminderForm) {
                setGenericReminderForm({
                  client_name: '',
                  client_surname: '',
                  phone: '',
                  reminder_date: '',
                  notes: '',
                });
              }
            }}
                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Nuevo Recordatorio"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowRecursoModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderGenericReminderForm(showRecursoReminderForm, () => setShowRecursoReminderForm(false), 'RECURSO', 'Nuevo Recordatorio')}
              
              {/* RECURSO Reminders */}
              {recursoReminders.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-3">
                    {recursoReminders.map((reminder) => {
                      const reminderDate = new Date(reminder.reminder_date);
                      return (
                        <div
                          key={reminder.id}
                          className="p-4 border-2 border-amber-300 rounded-xl bg-gradient-to-br from-amber-100 to-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">RECURSO</span>
                                <h3 className="font-bold text-amber-900 text-lg">{reminder.client_name} {reminder.client_surname}</h3>
                              </div>
                              {reminder.phone && (
                                <p className="text-sm text-amber-700 mt-1">Teléfono: {reminder.phone}</p>
                              )}
                              <p className="text-xs text-amber-600 mt-2">
                                Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {reminder.notes && (
                                <p className="text-xs text-amber-600 mt-1">Notas: {reminder.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
            onClick={async (e) => {
              e.stopPropagation();
              const dateStr = reminder.reminder_date;
              const date = new Date(dateStr);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              const formattedDate = localDate.toISOString().slice(0, 16);
              setEditingGenericReminder(reminder);
              setGenericReminderForm({
                client_name: reminder.client_name || '',
                client_surname: reminder.client_surname || '',
                phone: reminder.phone || '',
                reminder_date: formattedDate,
                notes: reminder.notes || '',
              });
              setShowRecursoReminderForm(true);
            }}
                                className="p-2 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRequerimientoConfirm({ reminder, isOpen: true });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {recurso.length === 0 && recursoReminders.length === 0 && !showRecursoReminderForm ? (
                <div className="text-center py-12">
                  <Gavel className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No hay recursos pendientes</p>
                  <p className="text-sm text-gray-400 mt-1">No hay casos que requieran presentar recurso</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recurso.length > 0 && (
                    <h3 className="text-lg font-semibold text-amber-900 mb-3">Clientes con Recursos Pendientes</h3>
                  )}
                  {recurso.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowRecursoModal(false);
                      }}
                      className="p-4 border-2 border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-amber-900 text-lg">{client.first_name} {client.last_name}</h3>
                          <p className="text-sm text-amber-700 mt-1">{client.case_type || 'No template'}</p>
                          {client.application_date && (
                            <p className="text-xs text-amber-600 mt-2">
                              Presentado: {new Date(client.application_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Gavel className="w-6 h-6 text-amber-600 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URGENTES Modal */}
      {showUrgentesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-red-900">{t('dashboard.urgentes')}</h2>
                  <p className="text-red-700 mt-1">{t('dashboard.urgentesDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
            onClick={() => {
              setShowUrgentesReminderForm(!showUrgentesReminderForm);
              setEditingGenericReminder(null);
              if (!showUrgentesReminderForm) {
                setGenericReminderForm({
                  client_name: '',
                  client_surname: '',
                  phone: '',
                  reminder_date: '',
                  notes: '',
                });
              }
            }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Nuevo Recordatorio"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowUrgentesModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderGenericReminderForm(showUrgentesReminderForm, () => setShowUrgentesReminderForm(false), 'URGENTES', 'Nuevo Recordatorio')}
              
              {/* URGENTES Reminders */}
              {urgentesReminders.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-3">
                    {urgentesReminders.map((reminder) => {
                      const reminderDate = new Date(reminder.reminder_date);
                      return (
                        <div
                          key={reminder.id}
                          className="p-4 border-2 border-red-300 rounded-xl bg-gradient-to-br from-red-100 to-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">URGENTES</span>
                                <h3 className="font-bold text-red-900 text-lg">{reminder.client_name} {reminder.client_surname}</h3>
                              </div>
                              {reminder.phone && (
                                <p className="text-sm text-red-700 mt-1">Teléfono: {reminder.phone}</p>
                              )}
                              <p className="text-xs text-red-600 mt-2">
                                Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {reminder.notes && (
                                <p className="text-xs text-red-600 mt-1">Notas: {reminder.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
            onClick={async (e) => {
              e.stopPropagation();
              const dateStr = reminder.reminder_date;
              const date = new Date(dateStr);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              const formattedDate = localDate.toISOString().slice(0, 16);
              setEditingGenericReminder(reminder);
              setGenericReminderForm({
                client_name: reminder.client_name || '',
                client_surname: reminder.client_surname || '',
                phone: reminder.phone || '',
                reminder_date: formattedDate,
                notes: reminder.notes || '',
              });
              setShowUrgentesReminderForm(true);
            }}
                                className="p-2 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRequerimientoConfirm({ reminder, isOpen: true });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {urgentes.length === 0 && urgentReminders.length === 0 && urgentesReminders.length === 0 && !showUrgentesReminderForm ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No hay trámites urgentes</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los trámites están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Urgent Reminders */}
                  {urgentReminders.map((reminder) => {
                    const reminderDate = new Date(reminder.reminder_date);
                    return (
                      <div
                        key={reminder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUrgentesModal(false);
                          setShowRecordatorioModal(true);
                          setEditingReminder(reminder);
                          const dateStr = reminder.reminder_date;
                          const date = new Date(dateStr);
                          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                          const formattedDate = localDate.toISOString().slice(0, 16);
                          setReminderForm({
                            client_id: reminder.client_id || '',
                            client_name: reminder.client_name || '',
                            client_surname: reminder.client_surname || '',
                            phone: reminder.phone || '',
                            reminder_date: formattedDate,
                            notes: reminder.notes || '',
                          });
                          setShowReminderForm(true);
                        }}
                        className="p-4 border-2 border-red-400 rounded-xl bg-gradient-to-br from-red-50 to-white cursor-pointer hover:border-red-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Bell className="w-4 h-4 text-red-600" />
                              <h3 className="font-bold text-red-900 text-lg">
                                {reminder.client_name} {reminder.client_surname}
                              </h3>
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                                RECORDATORIO
                              </span>
                            </div>
                            {reminder.phone && (
                              <p className="text-sm text-red-700">Tel: {reminder.phone}</p>
                            )}
                            <p className="text-sm text-red-700">
                              Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {reminder.notes && (
                              <p className="text-sm text-gray-600 mt-1">{reminder.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Urgent Clients */}
                  {urgentes.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowUrgentesModal(false);
                      }}
                      className="p-4 border-2 border-red-300 rounded-xl hover:border-red-400 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-red-50 to-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-red-900 text-lg">{client.first_name} {client.last_name}</h3>
                          <p className="text-sm text-red-700 mt-1">{client.case_type || 'No template'}</p>
                          <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Acción requerida en menos de 72 horas</p>
                        </div>
                        <AlertTriangle className="w-6 h-6 text-red-600 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECORDATORIO Modal */}
      {showRecordatorioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{t('dashboard.recordatorio')}</h2>
                  <p className="text-amber-700 mt-1">{t('dashboard.recordatorioDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowReminderForm(true);
                      setEditingReminder(null);
                      setReminderForm({
                        client_id: '',
                        client_name: '',
                        client_surname: '',
                        phone: '',
                        reminder_date: '',
                        notes: '',
                      });
                    }}
                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Add Reminder"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowRecordatorioModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {reminders.filter((r) => r.reminder_type !== 'REQUERIMIENTO').length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No hay recordatorios</p>
                  <p className="text-sm text-gray-400 mt-1">Agregue recordatorios para hacer seguimiento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.filter((r) => r.reminder_type !== 'REQUERIMIENTO').map((reminder) => {
                    const reminderDate = new Date(reminder.reminder_date);
                    const now = new Date();
                    const days3 = 3 * 24 * 60 * 60 * 1000;
                    const timeDiff = reminderDate.getTime() - now.getTime();
                    const isUrgent = timeDiff > 0 && timeDiff <= days3;
                    const isOverdue = timeDiff < 0;

                    return (
                      <div
                        key={reminder.id}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          isUrgent
                            ? 'border-red-300 bg-red-50'
                            : isOverdue
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-amber-900 text-lg">
                                {reminder.client_name} {reminder.client_surname}
                              </h3>
                              {isUrgent && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                                  URGENTE
                                </span>
                              )}
                              {isOverdue && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                  VENCIDO
                                </span>
                              )}
                            </div>
                            {reminder.phone && (
                              <p className="text-sm text-amber-700 mb-1">
                                <span className="font-semibold">Teléfono:</span> {reminder.phone}
                              </p>
                            )}
                            <p className="text-sm text-amber-700 mb-1">
                              <span className="font-semibold">Fecha:</span>{' '}
                              {reminderDate.toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {reminder.notes && (
                              <p className="text-sm text-gray-600 mt-2">{reminder.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingReminder(reminder);
                                const dateStr = reminder.reminder_date;
                                const date = new Date(dateStr);
                                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                const formattedDate = localDate.toISOString().slice(0, 16);
                                setReminderForm({
                                  client_id: reminder.client_id,
                                  client_name: reminder.client_name,
                                  client_surname: reminder.client_surname,
                                  phone: reminder.phone || '',
                                  reminder_date: formattedDate,
                                  notes: reminder.notes || '',
                                });
                                setShowReminderForm(true);
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  reminder: reminder,
                                });
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder Form Modal */}
      {showReminderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">
                {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
              </h3>
              <button
                onClick={() => {
                  setShowReminderForm(false);
                  setEditingReminder(null);
                  setReminderForm({
                    client_id: '',
                    client_name: '',
                    client_surname: '',
                    phone: '',
                    reminder_date: '',
                    notes: '',
                  });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const reminderDate = new Date(reminderForm.reminder_date);
                  const reminderData = {
                    client_id: reminderForm.client_id || '', // Optional, can be empty for standalone reminders
                    client_name: reminderForm.client_name.trim(),
                    client_surname: reminderForm.client_surname.trim(),
                    phone: reminderForm.phone.trim() || undefined,
                    reminder_date: reminderDate.toISOString(),
                    notes: reminderForm.notes.trim() || undefined,
                  };
                  if (editingReminder) {
                    await api.updateReminder(editingReminder.id, reminderData);
                  } else {
                    await api.createReminder(reminderData);
                  }
                  await loadData();
                  setShowReminderForm(false);
                  setEditingReminder(null);
                  setReminderForm({
                    client_id: '',
                    client_name: '',
                    client_surname: '',
                    phone: '',
                    reminder_date: '',
                    notes: '',
                  });
                } catch (error: any) {
                  alert('Error al guardar recordatorio: ' + error.message);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reminderForm.client_name}
                    onChange={(e) => setReminderForm({ ...reminderForm, client_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reminderForm.client_surname}
                    onChange={(e) => setReminderForm({ ...reminderForm, client_surname: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Apellido del cliente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={reminderForm.phone}
                  onChange={(e) => setReminderForm({ ...reminderForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha y Hora del Recordatorio <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reminderForm.reminder_date}
                  onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                <textarea
                  value={reminderForm.notes}
                  onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  rows={4}
                  placeholder="Notas adicionales sobre el recordatorio"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReminderForm(false);
                    setEditingReminder(null);
                    setReminderForm({
                      client_id: '',
                      client_name: '',
                      client_surname: '',
                      phone: '',
                      reminder_date: '',
                      notes: '',
                    });
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
                >
                  {editingReminder ? 'Actualizar' : 'Crear'} Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasscodeModal(false);
              setPasscodeInput('');
              setPasscodeError('');
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                  <Lock className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Access</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Enter passcode to view payments</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasscodeModal(false);
                  setPasscodeInput('');
                  setPasscodeError('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passcode</label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError('');
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center text-2xl tracking-widest font-mono"
                  placeholder="••••"
                  autoFocus
                  maxLength={10}
                />
                {passcodeError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{passcodeError}</span>
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscodeInput('');
                    setPasscodeError('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold shadow-lg"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAGOS Modal */}
      {showPagosModal && paymentsUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{t('dashboard.pagos')}</h2>
                  <p className="text-amber-700 mt-1">{t('dashboard.pagosDesc')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
            onClick={() => {
              setShowPagosReminderForm(!showPagosReminderForm);
              setEditingGenericReminder(null);
              if (!showPagosReminderForm) {
                setGenericReminderForm({
                  client_name: '',
                  client_surname: '',
                  phone: '',
                  reminder_date: '',
                  notes: '',
                });
              }
            }}
                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Nuevo Recordatorio"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPagosModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderGenericReminderForm(showPagosReminderForm, () => setShowPagosReminderForm(false), 'PAGOS', 'Nuevo Recordatorio')}
              
              {/* PAGOS Reminders */}
              {pagosReminders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Recordatorios de Pago</h3>
                  <div className="space-y-3">
                    {pagosReminders.map((reminder) => {
                      const reminderDate = new Date(reminder.reminder_date);
                      return (
                        <div
                          key={reminder.id}
                          className="p-4 border-2 border-amber-300 rounded-xl bg-gradient-to-br from-amber-100 to-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded">PAGOS</span>
                                <h3 className="font-bold text-amber-900 text-lg">{reminder.client_name} {reminder.client_surname}</h3>
                              </div>
                              {reminder.phone && (
                                <p className="text-sm text-amber-700 mt-1">Teléfono: {reminder.phone}</p>
                              )}
                              <p className="text-xs text-amber-600 mt-2">
                                Fecha: {reminderDate.toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {reminder.notes && (
                                <p className="text-xs text-amber-600 mt-1">Notas: {reminder.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
            onClick={async (e) => {
              e.stopPropagation();
              const dateStr = reminder.reminder_date;
              const date = new Date(dateStr);
              const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
              const formattedDate = localDate.toISOString().slice(0, 16);
              setEditingGenericReminder(reminder);
              setGenericReminderForm({
                client_name: reminder.client_name || '',
                client_surname: reminder.client_surname || '',
                phone: reminder.phone || '',
                reminder_date: formattedDate,
                notes: reminder.notes || '',
              });
              setShowPagosReminderForm(true);
            }}
                                className="p-2 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteRequerimientoConfirm({ reminder, isOpen: true });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Payment Statistics Summary */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <h3 className="text-sm font-semibold text-amber-900">Total Due</h3>
                  </div>
                  <p className="text-2xl font-bold text-amber-800">€{overallPaymentStats.totalDue.toFixed(2)}</p>
                  <p className="text-xs text-amber-600 mt-1">{overallPaymentStats.dueCount} {overallPaymentStats.dueCount === 1 ? 'client' : 'clients'}</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="text-sm font-semibold text-green-900">Total Advance</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-800">€{overallPaymentStats.totalAdvance.toFixed(2)}</p>
                  <p className="text-xs text-green-600 mt-1">{overallPaymentStats.advanceCount} {overallPaymentStats.advanceCount === 1 ? 'client' : 'clients'}</p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <h3 className="text-sm font-semibold text-gray-900">No Due</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{overallPaymentStats.noDueCount}</p>
                  <p className="text-xs text-gray-600 mt-1">{overallPaymentStats.noDueCount === 1 ? 'client' : 'clients'}</p>
                </div>
              </div>

              {/* Add Payment Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('dashboard.addPayment') || 'ADD Payment'}</span>
                </button>
              </div>

              {/* Payment Form */}
              {showPaymentForm && (
                <form onSubmit={handleAddPayment} className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Add Payment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input
                        type="text"
                        id="payment-client-name"
                        name="client_name"
                        required
                        value={paymentForm.client_name}
                        onChange={(e) => setPaymentForm({ ...paymentForm, client_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Surname *</label>
                      <input
                        type="text"
                        id="payment-client-surname"
                        name="client_surname"
                        required
                        value={paymentForm.client_surname}
                        onChange={(e) => setPaymentForm({ ...paymentForm, client_surname: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="payment-phone"
                        name="phone"
                        value={paymentForm.phone}
                        onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Phone (optional)"
                      />
                    </div>
                    <div className="relative" ref={paymentTemplateDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Case Template (Optional)</label>
                      <button
                        type="button"
                        onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-left flex items-center justify-between"
                      >
                        <span className={paymentForm.caseTemplateId ? 'text-gray-900' : 'text-gray-500'}>
                          {paymentForm.caseTemplateId 
                            ? templates.find(t => t.id === paymentForm.caseTemplateId)?.name || 'Select template'
                            : 'Select template (optional)'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTemplateDropdown ? 'transform rotate-180' : ''}`} />
                      </button>
                      {showTemplateDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                id="payment-template-search"
                                name="template_search"
                                placeholder="Search templates..."
                                value={templateSearchQuery}
                                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto max-h-48">
                            {templates.filter((template) => {
                              if (!templateSearchQuery.trim()) return true;
                              const query = templateSearchQuery.toLowerCase();
                              const name = (template.name || '').toLowerCase();
                              const description = (template.description || '').toLowerCase();
                              return name.startsWith(query) || description.startsWith(query);
                            }).length === 0 ? (
                              <div className="p-3 text-center text-gray-500 text-sm">No templates found</div>
                            ) : (
                              templates.filter((template) => {
                                if (!templateSearchQuery.trim()) return true;
                                const query = templateSearchQuery.toLowerCase();
                                const name = (template.name || '').toLowerCase();
                                const description = (template.description || '').toLowerCase();
                                return name.startsWith(query) || description.startsWith(query);
                              }).map((template) => (
                                <button
                                  key={template.id}
                                  type="button"
                                  onClick={() => {
                                    setPaymentForm({ ...paymentForm, caseTemplateId: template.id });
                                    setShowTemplateDropdown(false);
                                    setTemplateSearchQuery('');
                                  }}
                                  className={`w-full text-left px-3 py-2 hover:bg-green-50 transition-colors ${
                                    paymentForm.caseTemplateId === template.id ? 'bg-green-100 border-l-4 border-green-500' : ''
                                  }`}
                                >
                                  <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                    {template.name}
                                    {paymentForm.caseTemplateId === template.id && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  </div>
                                  {template.description && (
                                    <div className="text-xs text-gray-600 mt-0.5">{template.description}</div>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (€) *</label>
                      <input
                        type="number"
                        id="payment-amount-paid"
                        name="amount_paid"
                        step="0.01"
                        min="0"
                        required
                        value={paymentForm.amount_paid}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (€) *</label>
                      <input
                        type="number"
                        id="payment-total-amount"
                        name="total_amount"
                        step="0.01"
                        min="0"
                        required
                        value={paymentForm.total_amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, total_amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pending or Extra Payment (€)</label>
                      <input
                        type="number"
                        id="payment-pending-extra"
                        name="pending_extra"
                        step="0.01"
                        value={paymentForm.pending_extra}
                        onChange={(e) => setPaymentForm({ ...paymentForm, pending_extra: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="0.00 (optional)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Add pending or extra payment directly</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        rows={3}
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentForm({
                          client_name: '',
                          client_surname: '',
                          phone: '',
                          amount_paid: '',
                          total_amount: '',
                          pending_extra: '',
                          notes: '',
                          caseTemplateId: '',
                        });
                        setShowTemplateDropdown(false);
                        setTemplateSearchQuery('');
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Payment
                    </button>
                  </div>
                </form>
              )}

              {pagos.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No hay pagos pendientes</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los pagos están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pagos.map((client) => {
                    const totalFee = client.payment?.totalFee || 0;
                    const paidAmount = client.payment?.paidAmount || 0;
                    const remaining = totalFee - paidAmount;
                    const isAdvancePayment = remaining < 0;
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setShowPagosModal(false);
                        }}
                        className={`p-4 border-2 rounded-xl hover:shadow-md transition-all cursor-pointer bg-gradient-to-br ${
                          isAdvancePayment 
                            ? 'border-green-200 hover:border-green-300 from-green-50 to-white' 
                            : 'border-amber-200 hover:border-amber-300 from-amber-50 to-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg ${isAdvancePayment ? 'text-green-900' : 'text-amber-900'}`}>
                              {client.first_name} {client.last_name}
                            </h3>
                            <p className={`text-sm mt-1 ${isAdvancePayment ? 'text-green-700' : 'text-amber-700'}`}>
                              {client.case_type || 'No template'}
                            </p>
                            {client.phone && (
                              <p className={`text-xs mt-1 ${isAdvancePayment ? 'text-green-600' : 'text-amber-600'}`}>
                                Phone: {client.phone}
                              </p>
                            )}
                            <p className={`text-xs mt-2 font-semibold ${isAdvancePayment ? 'text-green-700' : 'text-amber-600'}`}>
                              {isAdvancePayment ? (
                                <>
                                  Advance Payment: €{Math.abs(remaining).toFixed(2)} / Total: €{totalFee.toFixed(2)} / Paid: €{paidAmount.toFixed(2)}
                                </>
                              ) : (
                                <>
                                  Remaining Payment: €{remaining.toFixed(2)} / Total: €{totalFee.toFixed(2)}
                                </>
                              )}
                            </p>
                          </div>
                          <DollarSign className={`w-6 h-6 ml-4 ${isAdvancePayment ? 'text-green-600' : 'text-amber-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => {
            setSelectedClient(null);
            if (returnToRequerimiento) {
              setReturnToRequerimiento(false);
              setShowRequerimientoModal(true);
            }
            // APORTAR DOCUMENTACIÓN modal should never reopen automatically
          }}
          onSuccess={async () => {
            await loadData();
            // APORTAR DOCUMENTACIÓN modal should never reopen automatically after document creation
          }}
        />
      )}

      {/* Ready to Submit Modal */}
      {showReadyToSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in my-4 sm:my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.readyToSubmitTitle')}</h2>
                <p className="text-slate-600 mt-1">{t('dashboard.readyToSubmitDesc')}</p>
              </div>
              <button
                onClick={() => setShowReadyToSubmitModal(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {readyToSubmit.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-lg">{t('dashboard.allSubmitted')}</p>
                <p className="text-sm text-slate-400 mt-1">{t('dashboard.noAwaiting')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {readyToSubmit.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setShowReadyToSubmitModal(false);
                    }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-emerald-50 rounded-xl hover:bg-emerald-100 border-2 border-emerald-200 transition-all duration-200 group cursor-pointer hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-emerald-200 group-hover:bg-emerald-300 p-2.5 rounded-lg transition-colors flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-base sm:text-lg group-hover:text-slate-700 transition-colors truncate">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 truncate mt-1">{client.case_type || t('clients.noTemplate')}</p>
                      </div>
                    </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="inline-flex items-center space-x-2 bg-white px-3 sm:px-4 py-2 rounded-lg border border-green-200">
                          <span className="text-base sm:text-lg font-bold text-green-700">
                            {client.required_documents?.filter((d: any) => d.submitted).length || 0}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-base sm:text-lg font-semibold text-slate-600">
                            {client.required_documents?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1 font-medium">{t('dashboard.documents')}</p>
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Awaiting Submission Modal */}
      {showAwaitingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in my-4 sm:my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.awaitingSubmissionTitle')}</h2>
                <p className="text-slate-600 mt-1">{t('dashboard.awaitingSubmissionDesc')}</p>
              </div>
              <button
                onClick={() => setShowAwaitingModal(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {awaitingSubmission.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-lg">{t('dashboard.allSubmitted')}</p>
                <p className="text-sm text-slate-400 mt-1">{t('dashboard.noAwaiting')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {awaitingSubmission.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setShowAwaitingModal(false);
                    }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-amber-50 rounded-xl hover:bg-amber-100 border-2 border-amber-200 transition-all duration-200 group cursor-pointer hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-amber-200 group-hover:bg-amber-300 p-2.5 rounded-lg transition-colors flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-base sm:text-lg group-hover:text-slate-700 transition-colors truncate">
                          {client.first_name} {client.last_name}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 gap-1 sm:gap-0">
                          <p className="text-xs sm:text-sm text-slate-600 truncate">{client.case_type || 'No template assigned'}</p>
                          {(() => {
                            // Calculate reminder status
                            const calculateReminderStatus = () => {
                              const pendingRequiredDocs = client.required_documents?.filter((d: any) => !d.submitted && !d.isOptional).length || 0;
                              if (pendingRequiredDocs === 0) return null;
                              
                              // Find last activity date
                              // If no documents uploaded, reminder starts from client creation date
                              // If documents uploaded, reminder starts from most recent upload date
                              const submittedDocs = client.required_documents?.filter((d: any) => d.submitted && d.uploadedAt) || [];
                              let lastActivityDate: Date;
                              let hasNoUploads = false;
                              
                              if (submittedDocs.length > 0) {
                                const uploadDates = submittedDocs
                                  .map((d: any) => new Date(d.uploadedAt))
                                  .sort((a: Date, b: Date) => b.getTime() - a.getTime());
                                lastActivityDate = uploadDates[0];
                              } else {
                                // No documents uploaded yet - reminder starts from client creation
                                lastActivityDate = new Date(client.created_at);
                                hasNoUploads = true;
                              }
                              
                              const reminderDays = client.reminder_interval_days || 10;
                              const nextReminderDate = new Date(lastActivityDate);
                              nextReminderDate.setDate(nextReminderDate.getDate() + reminderDays);
                              
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              nextReminderDate.setHours(0, 0, 0, 0);
                              
                              const daysUntilReminder = Math.ceil((nextReminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return {
                                daysUntilReminder,
                                isOverdue: daysUntilReminder < 0,
                                isDueSoon: daysUntilReminder <= 2 && daysUntilReminder >= 0,
                                hasNoUploads, // Track if no documents uploaded yet
                              };
                            };
                            
                            const reminderStatus = calculateReminderStatus();
                            
                            if (!reminderStatus) {
                              return (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <p className="text-xs text-amber-700 font-medium">
                                    {t('dashboard.interval')}: {client.reminder_interval_days} {t('dashboard.days')}
                            </p>
                          </div>
                              );
                            }
                            
                            const { daysUntilReminder, isOverdue, isDueSoon, hasNoUploads } = reminderStatus;
                            
                            return (
                              <div className="flex items-center space-x-1">
                                <Clock className={`w-3.5 h-3.5 ${
                                  isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-600' : 'text-amber-500'
                                }`} />
                                <p className={`text-xs font-medium ${
                                  isOverdue ? 'text-red-700' : isDueSoon ? 'text-amber-700' : 'text-amber-600'
                                }`}>
                                  {isOverdue 
                                    ? `⚠️ ${t('dashboard.overdue')} ${Math.abs(daysUntilReminder)} ${t('dashboard.days')}${hasNoUploads ? ` ${t('dashboard.noDocs')}` : ''}`
                                    : daysUntilReminder === 0
                                    ? `⚠️ ${t('dashboard.dueToday')}`
                                    : isDueSoon
                                    ? `⚠️ ${t('dashboard.dueIn')} ${daysUntilReminder} ${t('dashboard.days')}${hasNoUploads ? ` ${t('dashboard.noDocs')}` : ''}`
                                    : `${t('dashboard.dueIn')} ${daysUntilReminder} ${t('dashboard.days')}${hasNoUploads ? ` ${t('dashboard.noDocs')}` : ''}`
                                  }
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="inline-flex items-center space-x-2 bg-white px-3 sm:px-4 py-2 rounded-lg border border-amber-200">
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {client.required_documents?.filter((d: any) => d.submitted).length || 0}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-base sm:text-lg font-semibold text-slate-600">
                          {client.required_documents?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1 font-medium">{t('dashboard.documents')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submitted to Administrative Modal */}
      {showSubmittedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in my-4 sm:my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.submittedToAdminTitle')}</h2>
                <p className="text-slate-600 mt-1">{t('dashboard.submittedToAdminDesc')}</p>
              </div>
              <button
                onClick={() => setShowSubmittedModal(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedToAdmin.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-lg">{t('dashboard.noSubmitted')}</p>
                <p className="text-sm text-slate-400 mt-1">{t('dashboard.submitCases')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submittedToAdmin.map((client) => {
                  // Calculate administrative silence countdown
                  const calculateSilenceCountdown = () => {
                    if (!client.application_date) return null;
                    const applicationDate = new Date(client.application_date);
                    const silenceDays = client.administrative_silence_days || 60;
                    const endDate = new Date(applicationDate);
                    endDate.setDate(endDate.getDate() + silenceDays);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);
                    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return {
                      daysRemaining,
                      endDate,
                      isExpired: daysRemaining < 0,
                      isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
                    };
                  };
                  const silenceInfo = calculateSilenceCountdown();

                  return (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowSubmittedModal(false);
                      }}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer hover:shadow-md ${
                        silenceInfo?.isExpired
                          ? 'bg-red-50 border-red-200 hover:border-red-300'
                          : silenceInfo?.isExpiringSoon
                          ? 'bg-orange-50 border-orange-200 hover:border-orange-300'
                          : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`p-2 sm:p-2.5 rounded-lg transition-colors flex-shrink-0 ${
                          silenceInfo?.isExpired
                            ? 'bg-red-200 group-hover:bg-red-300'
                            : silenceInfo?.isExpiringSoon
                            ? 'bg-orange-200 group-hover:bg-orange-300'
                            : 'bg-emerald-200 group-hover:bg-emerald-300'
                        }`}>
                          <CheckCircle className={`w-5 h-5 ${
                            silenceInfo?.isExpired
                              ? 'text-red-700'
                              : silenceInfo?.isExpiringSoon
                              ? 'text-orange-700'
                              : 'text-emerald-700'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-base sm:text-lg group-hover:text-slate-700 transition-colors truncate">
                            {client.first_name} {client.last_name}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 gap-1 sm:gap-0">
                            <p className="text-xs sm:text-sm text-slate-600 truncate">{client.case_type || 'No template assigned'}</p>
                            {client.application_date && (
                              <div className="flex items-center space-x-1">
                                <Clock className={`w-3.5 h-3.5 ${
                                  silenceInfo?.isExpired
                                    ? 'text-red-600'
                                    : silenceInfo?.isExpiringSoon
                                    ? 'text-orange-600'
                                    : 'text-emerald-600'
                                }`} />
                                <p className={`text-xs font-medium ${
                                  silenceInfo?.isExpired
                                    ? 'text-red-700'
                                    : silenceInfo?.isExpiringSoon
                                    ? 'text-orange-700'
                                    : 'text-emerald-700'
                                }`}>
                                  {silenceInfo?.isExpired
                                    ? `${t('dashboard.expired')} ${Math.abs(silenceInfo.daysRemaining)} ${t('dashboard.daysAgo')}`
                                    : silenceInfo?.isExpiringSoon
                                    ? t('dashboard.expiringSoon', { days: silenceInfo.daysRemaining })
                                    : `${silenceInfo?.daysRemaining || 0} ${t('dashboard.daysRemaining')}`}
                                </p>
                              </div>
                            )}
                          </div>
                          {client.application_date && (
                            <p className="text-xs text-slate-500 mt-1">
                              {t('dashboard.submitted')}: {new Date(client.application_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className={`inline-flex items-center space-x-2 bg-white px-3 sm:px-4 py-2 rounded-lg border ${
                          silenceInfo?.isExpired
                            ? 'border-red-200'
                            : silenceInfo?.isExpiringSoon
                            ? 'border-orange-200'
                            : 'border-emerald-200'
                        }`}>
                          <span className="text-base sm:text-lg font-bold text-slate-900">
                            {client.required_documents?.filter((d: any) => d.submitted).length || 0}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-base sm:text-lg font-semibold text-slate-600">
                            {client.required_documents?.length || 0}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 font-medium ${
                          silenceInfo?.isExpired
                            ? 'text-red-600'
                            : silenceInfo?.isExpiringSoon
                            ? 'text-orange-600'
                            : 'text-emerald-600'
                        }`}>
                          {t('dashboard.documents')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Eliminar Recordatorio"
        message={`¿Está seguro de que desea eliminar el recordatorio para ${deleteConfirm.reminder ? `${deleteConfirm.reminder.client_name} ${deleteConfirm.reminder.client_surname}` : 'este cliente'}?`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={async () => {
          if (deleteConfirm.reminder) {
            try {
              await api.deleteReminder(deleteConfirm.reminder.id);
              await loadData();
              showToast('Recordatorio eliminado exitosamente', 'success');
              setDeleteConfirm({ isOpen: false, reminder: null });
            } catch (error: any) {
              showToast('Error al eliminar recordatorio: ' + error.message, 'error');
              setDeleteConfirm({ isOpen: false, reminder: null });
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirm({ isOpen: false, reminder: null });
        }}
      />

      {/* Delete Confirmation Dialog for REQUERIMIENTO Reminders */}
      <ConfirmDialog
        isOpen={deleteRequerimientoConfirm.isOpen}
        title="Eliminar Recordatorio"
        message={deleteRequerimientoConfirm.reminder ? `¿Estás seguro de que deseas eliminar el recordatorio de ${deleteRequerimientoConfirm.reminder.client_name} ${deleteRequerimientoConfirm.reminder.client_surname}?` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={async () => {
          if (deleteRequerimientoConfirm.reminder) {
            try {
              await api.deleteReminder(deleteRequerimientoConfirm.reminder.id);
              showToast('Recordatorio eliminado exitosamente', 'success');
              setDeleteRequerimientoConfirm({ reminder: null, isOpen: false });
              await loadData();
            } catch (error: any) {
              showToast(error.message || 'Error al eliminar recordatorio', 'error');
            }
          }
        }}
        onCancel={() => setDeleteRequerimientoConfirm({ reminder: null, isOpen: false })}
      />
    </div>
  );
}

