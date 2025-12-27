import { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle, FileText, Download, Trash2, Plus, DollarSign, StickyNote, Archive, XCircle, AlertCircle, Send, Clock, Eye, ToggleLeft, ToggleRight, Calendar, GripVertical, Search, Edit2, Square, CheckSquare } from 'lucide-react';
import JSZip from 'jszip';
import { api } from '../utils/api';
import { Client, RequiredDocument, AdditionalDocument, RequestedDocument, CaseTemplate } from '../types';
import ConfirmDialog from './ConfirmDialog';
import { showToast } from './Toast';

interface Props {
  client: Client;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function ClientDetailsModal({ client, onClose, onSuccess }: Props) {
  const [clientData, setClientData] = useState<Client>(client);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAdditionalDocForm, setShowAdditionalDocForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', note: '' });
  const [additionalDocForm, setAdditionalDocForm] = useState({ name: '', description: '', file: null as File | null, reminder_days: 10 });
  const [editingAdditionalDoc, setEditingAdditionalDoc] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [notes, setNotes] = useState(client.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [details, setDetails] = useState(client.details || '');
  const [savingDetails, setSavingDetails] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; fileName: string } | null>(null);
  const [customReminderDate, setCustomReminderDate] = useState(client.custom_reminder_date || '');
  const [savingReminder, setSavingReminder] = useState(false);
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [tempReminderDate, setTempReminderDate] = useState('');
  const [showRequestedDocForm, setShowRequestedDocForm] = useState(false);
  const [requestedDocForm, setRequestedDocForm] = useState({ name: '', description: '' });
  const [uploadingRequestedDoc, setUploadingRequestedDoc] = useState<string | null>(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [durationDays, setDurationDays] = useState(client.requested_documents_reminder_duration_days || 10);
  const [showAportarDocForm, setShowAportarDocForm] = useState(false);
  const [aportarDocForm, setAportarDocForm] = useState({ name: '', description: '', file: null as File | null, reminder_days: 10 });
  const [editingAportarDoc, setEditingAportarDoc] = useState<string | null>(null);
  const [showRequerimientoForm, setShowRequerimientoForm] = useState(false);
  const [requerimientoForm, setRequerimientoForm] = useState({ name: '', description: '', file: null as File | null, reminder_days: 10 });
  const [editingRequerimientoDoc, setEditingRequerimientoDoc] = useState<string | null>(null);
  const [showResolucionForm, setShowResolucionForm] = useState(false);
  const [resolucionForm, setResolucionForm] = useState({ name: '', description: '', file: null as File | null, reminder_days: 10 });
  const [editingResolucionDoc, setEditingResolucionDoc] = useState<string | null>(null);
  const [showJustificanteForm, setShowJustificanteForm] = useState(false);
  const [justificanteForm, setJustificanteForm] = useState({ name: '', description: '', file: null as File | null, reminder_days: 10 });
  const [editingJustificanteDoc, setEditingJustificanteDoc] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [savingClientInfo, setSavingClientInfo] = useState(false);
  const [clientInfoForm, setClientInfoForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    parent_name: '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadClient();
    loadCurrentUser();
    loadTemplates();
  }, [client.id]);

  // Close template dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };

    if (showTemplateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateDropdown]);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUserName(user.name || user.email || '');
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  useEffect(() => {
    setNotes(clientData.notes || '');
    setDetails(clientData.details || '');
    setCustomReminderDate(clientData.custom_reminder_date || '');
    setClientInfoForm({
      first_name: clientData.first_name || '',
      last_name: clientData.last_name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      parent_name: clientData.parent_name || '',
    });
  }, [clientData.notes, clientData.details, clientData.custom_reminder_date, clientData.first_name, clientData.last_name, clientData.email, clientData.phone, clientData.parent_name]);

  const loadClient = async () => {
    try {
      const data = await api.getClient(client.id);
      setClientData(data);
    } catch (error) {
      console.error('Failed to load client:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.getCaseTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (!templateSearchQuery.trim()) return true;
    const query = templateSearchQuery.toLowerCase();
    const name = (template.name || '').toLowerCase();
    const description = (template.description || '').toLowerCase();
    
    return name.startsWith(query) || description.startsWith(query);
  });

  const selectedTemplate = templates.find(t => t.id === clientData.case_template_id);

  const handleTemplateChange = async (templateId: string) => {
    setSavingTemplate(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        showToast('Template not found', 'error');
        return;
      }

      // Update client with new template
      await api.updateClient(clientData.id, {
        case_template_id: templateId,
        case_type: template.name,
        // Update required documents from template
        required_documents: template.required_documents.map((doc: any) => ({
          code: doc.code,
          name: doc.name,
          description: doc.description || '',
          submitted: false,
          fileUrl: null,
          uploadedAt: null,
          isOptional: false,
        })),
        reminder_interval_days: template.reminder_interval_days,
        administrative_silence_days: template.administrative_silence_days,
      });

      await loadClient();
      setShowTemplateDropdown(false);
      setTemplateSearchQuery('');
      showToast('Template updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update template', 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSaveClientInfo = async () => {
    if (!clientInfoForm.first_name.trim() || !clientInfoForm.last_name.trim()) {
      showToast('First name and last name are required', 'error');
      return;
    }

    setSavingClientInfo(true);
    try {
      await api.updateClient(clientData.id, {
        first_name: clientInfoForm.first_name.trim(),
        last_name: clientInfoForm.last_name.trim(),
        email: clientInfoForm.email.trim() || undefined,
        phone: clientInfoForm.phone.trim() || undefined,
        parent_name: clientInfoForm.parent_name.trim() || undefined,
      });

      await loadClient();
      setEditingClientInfo(false);
      showToast('Client information updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update client information', 'error');
    } finally {
      setSavingClientInfo(false);
    }
  };

  const handleFileUpload = async (documentCode: string, file: File) => {
    setError('');
    if (!currentUserName.trim()) {
      setError('User account information not available');
      showToast('Unable to identify user account. Please refresh the page.', 'error');
      return;
    }
    setUploading(documentCode);

    try {
      await api.uploadDocument(client.id, documentCode, file, currentUserName);
      await loadClient();
      onSuccess();
      showToast('Document uploaded successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload document';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveDocument = async (documentCode: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
    setError('');
    try {
      await api.removeDocument(client.id, documentCode);
      await loadClient();
      onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error: any) {
      setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    try {
      const documents = [...(clientData.required_documents || [])];
      const [draggedDoc] = documents.splice(draggedIndex, 1);
      documents.splice(dropIndex, 0, draggedDoc);

      await api.updateClient(client.id, {
        required_documents: documents,
      });
      await loadClient();
      onSuccess();
      showToast('Document order updated successfully', 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to reorder document');
      showToast(error.message || 'Failed to reorder document', 'error');
    } finally {
      setDraggedIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleOptional = async (documentCode: string, currentOptional: boolean) => {
    setError('');
    try {
      const updatedDocuments = clientData.required_documents.map((doc: any) => {
        if (doc.code === documentCode) {
          return {
            ...doc,
            isOptional: !currentOptional,
          };
        }
        return doc;
      });

      await api.updateClient(client.id, {
        required_documents: updatedDocuments,
      });
      await loadClient();
      // Don't call onSuccess() here - loadClient() already updates the state
      // onSuccess() would trigger a full dashboard reload which is unnecessary
    } catch (error: any) {
      setError(error.message || 'Failed to update document');
      showToast(error.message || 'Failed to update document', 'error');
    }
  };

  const handleMakeAllOptional = async () => {
    setError('');
    try {
      const updatedDocuments = clientData.required_documents.map((doc: any) => ({
        ...doc,
        isOptional: true,
      }));

      await api.updateClient(client.id, {
        required_documents: updatedDocuments,
      });
      setSelectedDocuments(new Set());
      await loadClient();
      // Don't call onSuccess() here - loadClient() already updates the state
      showToast('All documents marked as optional', 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to update documents');
      showToast(error.message || 'Failed to update documents', 'error');
    }
  };

  const handleToggleDocumentSelection = (documentCode: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentCode)) {
        newSet.delete(documentCode);
      } else {
        newSet.add(documentCode);
      }
      return newSet;
    });
  };

  const handleSelectAllDocuments = () => {
    if (!clientData.required_documents) return;
    const allDocuments = clientData.required_documents
      .map((d: any) => d.code);
    
    // If all are already selected, deselect all; otherwise, select all
    const allSelected = allDocuments.length > 0 && 
      allDocuments.every(code => selectedDocuments.has(code));
    
    if (allSelected) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(allDocuments));
    }
  };


  const handleMakeSelectedOptional = async () => {
    if (selectedDocuments.size === 0) {
      showToast('Please select at least one document', 'error');
      return;
    }

    const selectedCount = selectedDocuments.size;
    setError('');
    try {
      const updatedDocuments = clientData.required_documents.map((doc: any) => {
        if (selectedDocuments.has(doc.code)) {
          return {
            ...doc,
            isOptional: true,
          };
        }
        return doc;
      });

      await api.updateClient(client.id, {
        required_documents: updatedDocuments,
      });
      setSelectedDocuments(new Set());
      await loadClient();
      // Don't call onSuccess() here as it might cause duplicate reloads
      showToast(`${selectedCount} document(s) marked as optional`, 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to update documents');
      showToast(error.message || 'Failed to update documents', 'error');
    }
  };

  const handleMakeSelectedRequired = async () => {
    if (selectedDocuments.size === 0) {
      showToast('Please select at least one document', 'error');
      return;
    }

    const selectedCount = selectedDocuments.size;
    setError('');
    try {
      const updatedDocuments = clientData.required_documents.map((doc: any) => {
        if (selectedDocuments.has(doc.code)) {
          return {
            ...doc,
            isOptional: false,
          };
        }
        return doc;
      });

      await api.updateClient(client.id, {
        required_documents: updatedDocuments,
      });
      setSelectedDocuments(new Set());
      await loadClient();
      // Don't call onSuccess() here as it might cause duplicate reloads
      showToast(`${selectedCount} document(s) marked as required`, 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to update documents');
      showToast(error.message || 'Failed to update documents', 'error');
    }
  };

  const handleAddRequestedDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!requestedDocForm.name.trim()) {
      setError('Document name is required');
      return;
    }
    try {
      await api.addRequestedDocument(client.id, {
        name: requestedDocForm.name.trim(),
        description: requestedDocForm.description.trim() || undefined,
      });
      setRequestedDocForm({ name: '', description: '' });
      setShowRequestedDocForm(false);
      await loadClient();
      onSuccess();
      showToast('Requested document added successfully', 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to add requested document');
      showToast(error.message || 'Failed to add requested document', 'error');
    }
  };

  const handleUploadRequestedDocument = async (documentCode: string, file: File) => {
    setError('');
    if (!currentUserName.trim()) {
      setError('User account information not available');
      showToast('Unable to identify user account. Please refresh the page.', 'error');
      return;
    }
    setUploadingRequestedDoc(documentCode);
    try {
      await api.uploadRequestedDocument(client.id, documentCode, file, currentUserName);
      await loadClient();
      onSuccess();
      showToast('Requested document uploaded successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload requested document';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setUploadingRequestedDoc(null);
    }
  };

  const handleRemoveRequestedDocument = async (documentCode: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Requested Document',
      message: 'Are you sure you want to remove this requested document?',
      type: 'warning',
      onConfirm: async () => {
        setError('');
        try {
          await api.removeRequestedDocument(client.id, documentCode);
          await loadClient();
          onSuccess();
          showToast('Requested document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error: any) {
          setError(error.message || 'Failed to remove requested document');
          showToast(error.message || 'Failed to remove requested document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleUploadAportarDocumentacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!aportarDocForm.name.trim()) {
      setError('Document name is required');
      return;
    }

    if (editingAportarDoc) {
      // Update existing document
      setUploading('aportar');
      try {
        if (aportarDocForm.file && currentUserName.trim()) {
          await api.uploadAportarDocumentacion(
            client.id,
            aportarDocForm.name,
            aportarDocForm.description,
            aportarDocForm.file,
            currentUserName,
            aportarDocForm.reminder_days
          );
        } else {
          await api.updateAportarDocumentacion(
            client.id,
            editingAportarDoc,
            {
              name: aportarDocForm.name,
              description: aportarDocForm.description,
              reminder_days: aportarDocForm.reminder_days,
            }
          );
        }
        setAportarDocForm({ name: '', description: '', file: null, reminder_days: 10 });
        setEditingAportarDoc(null);
        setShowAportarDocForm(false);
        await loadClient();
        onSuccess();
        showToast('Document updated successfully', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update document';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setUploading(null);
      }
    } else {
      // Create new document
      if (aportarDocForm.file) {
        if (!currentUserName.trim()) {
          setError('User account information not available');
          showToast('Unable to identify user account. Please refresh the page.', 'error');
          return;
        }
        setUploading('aportar');
        try {
          const updatedClient = await api.uploadAportarDocumentacion(
            client.id,
            aportarDocForm.name,
            aportarDocForm.description,
            aportarDocForm.file,
            currentUserName,
            aportarDocForm.reminder_days
          );
          // Use the response from the API call to update clientData immediately
          if (updatedClient) {
            setClientData(updatedClient);
          } else {
            // Fallback: reload client if response doesn't have updated data
            await loadClient();
          }
          setAportarDocForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowAportarDocForm(false);
          // Call onSuccess to refresh data in Dashboard
          if (onSuccess) {
            await onSuccess();
          }
          showToast('Document created successfully', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      } else {
        setUploading('aportar');
        try {
          const updatedClient = await api.createAportarDocumentacion(
            client.id,
            {
              name: aportarDocForm.name,
              description: aportarDocForm.description,
              reminder_days: aportarDocForm.reminder_days,
            }
          );
          // Use the response from the API call to update clientData immediately
          if (updatedClient) {
            setClientData(updatedClient);
          } else {
            // Fallback: reload client if response doesn't have updated data
            await loadClient();
          }
          setAportarDocForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowAportarDocForm(false);
          // Call onSuccess to refresh data in Dashboard
          if (onSuccess) {
            await onSuccess();
          }
          showToast('Document entry created successfully. You can upload the file later.', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      }
    }
  };

  const handleRemoveAportarDocumentacion = async (documentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
        setError('');
        try {
          await api.removeAportarDocumentacion(client.id, documentId);
          await loadClient();
          onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error: any) {
          setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };


  const handleUploadRequerimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!requerimientoForm.name.trim()) {
      setError('Document name is required');
      return;
    }

    if (editingRequerimientoDoc) {
      // Update existing document
      setUploading('requerimiento');
      try {
        if (requerimientoForm.file && currentUserName.trim()) {
          await api.uploadRequerimiento(
            client.id,
            requerimientoForm.name,
            requerimientoForm.description,
            requerimientoForm.file,
            currentUserName
          );
        } else {
          await api.updateRequerimiento(
            client.id,
            editingRequerimientoDoc,
            {
              name: requerimientoForm.name,
              description: requerimientoForm.description,
              reminder_days: requerimientoForm.reminder_days,
            }
          );
        }
        setRequerimientoForm({ name: '', description: '', file: null, reminder_days: 10 });
        setEditingRequerimientoDoc(null);
        setShowRequerimientoForm(false);
        await loadClient();
        onSuccess();
        showToast('Document updated successfully', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update document';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setUploading(null);
      }
    } else {
      // Create new document
      if (requerimientoForm.file) {
        if (!currentUserName.trim()) {
          setError('User account information not available');
          showToast('Unable to identify user account. Please refresh the page.', 'error');
          return;
        }
        setUploading('requerimiento');
        try {
          await api.uploadRequerimiento(
            client.id,
            requerimientoForm.name,
            requerimientoForm.description,
            requerimientoForm.file,
            currentUserName
          );
          setRequerimientoForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowRequerimientoForm(false);
          await loadClient();
          onSuccess();
          showToast('Document created successfully', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      } else {
        setUploading('requerimiento');
        try {
          await api.createRequerimiento(
            client.id,
            {
              name: requerimientoForm.name,
              description: requerimientoForm.description,
              reminder_days: requerimientoForm.reminder_days,
            }
          );
          setRequerimientoForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowRequerimientoForm(false);
          await loadClient();
          onSuccess();
          showToast('Document entry created successfully. You can upload the file later.', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      }
    }
  };

  const handleRemoveRequerimiento = async (documentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
        setError('');
        try {
          await api.removeRequerimiento(client.id, documentId);
          await loadClient();
          onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error: any) {
          setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleUploadResolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resolucionForm.name.trim()) {
      setError('Document name is required');
      return;
    }

    if (editingResolucionDoc) {
      // Update existing document
      setUploading('resolucion');
      try {
        if (resolucionForm.file && currentUserName.trim()) {
          await api.uploadResolucion(
            client.id,
            resolucionForm.name,
            resolucionForm.description,
            resolucionForm.file,
            currentUserName
          );
        } else {
          await api.updateResolucion(
            client.id,
            editingResolucionDoc,
            {
              name: resolucionForm.name,
              description: resolucionForm.description,
              reminder_days: resolucionForm.reminder_days,
            }
          );
        }
        setResolucionForm({ name: '', description: '', file: null, reminder_days: 10 });
        setEditingResolucionDoc(null);
        setShowResolucionForm(false);
        await loadClient();
        onSuccess();
        showToast('Document updated successfully', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update document';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setUploading(null);
      }
    } else {
      // Create new document
      if (resolucionForm.file) {
        if (!currentUserName.trim()) {
          setError('User account information not available');
          showToast('Unable to identify user account. Please refresh the page.', 'error');
          return;
        }
        setUploading('resolucion');
        try {
          await api.uploadResolucion(
            client.id,
            resolucionForm.name,
            resolucionForm.description,
            resolucionForm.file,
            currentUserName
          );
          setResolucionForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowResolucionForm(false);
          await loadClient();
          onSuccess();
          showToast('Document created successfully', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      } else {
        setUploading('resolucion');
        try {
          await api.createResolucion(
            client.id,
            {
              name: resolucionForm.name,
              description: resolucionForm.description,
              reminder_days: resolucionForm.reminder_days,
            }
          );
          setResolucionForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowResolucionForm(false);
          await loadClient();
          onSuccess();
          showToast('Document entry created successfully. You can upload the file later.', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      }
    }
  };

  const handleRemoveResolucion = async (documentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
        setError('');
        try {
          await api.removeResolucion(client.id, documentId);
          await loadClient();
          onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error: any) {
          setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleUploadJustificante = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!justificanteForm.name.trim()) {
      setError('Document name is required');
      return;
    }

    if (editingJustificanteDoc) {
      // Update existing document
      setUploading('justificante');
      try {
        if (justificanteForm.file && currentUserName.trim()) {
          await api.uploadJustificante(
            client.id,
            justificanteForm.name,
            justificanteForm.description,
            justificanteForm.file,
            currentUserName
          );
        } else {
          await api.updateJustificante(
            client.id,
            editingJustificanteDoc,
            {
              name: justificanteForm.name,
              description: justificanteForm.description,
              reminder_days: justificanteForm.reminder_days,
            }
          );
        }
        setJustificanteForm({ name: '', description: '', file: null, reminder_days: 10 });
        setEditingJustificanteDoc(null);
        setShowJustificanteForm(false);
        await loadClient();
        onSuccess();
        showToast('Document updated successfully', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update document';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setUploading(null);
      }
    } else {
      // Create new document
      if (justificanteForm.file) {
        if (!currentUserName.trim()) {
          setError('User account information not available');
          showToast('Unable to identify user account. Please refresh the page.', 'error');
          return;
        }
        setUploading('justificante');
        try {
          await api.uploadJustificante(
            client.id,
            justificanteForm.name,
            justificanteForm.description,
            justificanteForm.file,
            currentUserName
          );
          setJustificanteForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowJustificanteForm(false);
          await loadClient();
          onSuccess();
          showToast('Document created successfully', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      } else {
        setUploading('justificante');
        try {
          await api.createJustificante(
            client.id,
            {
              name: justificanteForm.name,
              description: justificanteForm.description,
              reminder_days: justificanteForm.reminder_days,
            }
          );
          setJustificanteForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowJustificanteForm(false);
          await loadClient();
          onSuccess();
          showToast('Document entry created successfully. You can upload the file later.', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      }
    }
  };

  const handleRemoveJustificante = async (documentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
        setError('');
        try {
          await api.removeJustificante(client.id, documentId);
          await loadClient();
          onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error: any) {
          setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleSetReminderDuration = async () => {
    setError('');
    if (!durationDays || durationDays < 1 || durationDays > 365) {
      setError('Duration must be between 1 and 365 days');
      return;
    }
    try {
      await api.setRequestedDocumentsReminderDuration(client.id, durationDays);
      setShowDurationModal(false);
      await loadClient();
      onSuccess();
      showToast('Reminder duration updated successfully', 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to update reminder duration');
      showToast(error.message || 'Failed to update reminder duration', 'error');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await api.addPayment(client.id, amount, paymentForm.method, paymentForm.note);
      setPaymentForm({ amount: '', method: 'Cash', note: '' });
      setShowPaymentForm(false);
      await loadClient();
      
      // Check if payment is complete and clear reminder if so
      const updatedClient = await api.getClient(client.id);
      const remainingAmount = (updatedClient.payment?.totalFee || 0) - (updatedClient.payment?.paidAmount || 0);
      if (remainingAmount <= 0 && updatedClient.custom_reminder_date) {
        // Clear the reminder date since payment is complete
        await api.updateClient(client.id, { custom_reminder_date: null });
        setCustomReminderDate('');
      }
      
      await loadClient();
      onSuccess();
      showToast(`Payment of €${amount} added successfully`, 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add payment';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setError('');
    try {
      await api.updateNotes(client.id, notes);
      await loadClient();
      onSuccess();
      showToast('Notes saved successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save notes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    setError('');
    try {
      await api.updateClient(client.id, { details });
      await loadClient();
      onSuccess();
      showToast('Details saved successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save details';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingDetails(false);
    }
  };


  const handleOpenReminderCalendar = () => {
    setTempReminderDate(customReminderDate || '');
    setShowReminderCalendar(true);
  };

  const handleSaveReminderFromCalendar = async () => {
    if (!tempReminderDate) {
      setError('Please select a date');
      return;
    }
    setSavingReminder(true);
    setError('');
    try {
      await api.updateClient(client.id, { custom_reminder_date: tempReminderDate });
      setCustomReminderDate(tempReminderDate);
      setShowReminderCalendar(false);
      await loadClient();
      onSuccess();
      showToast('Payment reminder saved successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save reminder date';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleUploadAdditionalDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!additionalDocForm.name.trim()) {
      setError('Document name is required');
      return;
    }

    if (editingAdditionalDoc) {
      // Update existing document (reminder only, or upload file if provided)
      setUploading('additional');
      try {
        if (additionalDocForm.file && currentUserName.trim()) {
          // Upload file to existing document
          await api.uploadAdditionalDocument(
            client.id,
            additionalDocForm.name,
            additionalDocForm.description,
            additionalDocForm.file,
            currentUserName
          );
        } else {
          // Update reminder only
          await api.updateAdditionalDocument(
            client.id,
            editingAdditionalDoc,
            {
              name: additionalDocForm.name,
              description: additionalDocForm.description,
              reminder_days: additionalDocForm.reminder_days,
            }
          );
        }
        setAdditionalDocForm({ name: '', description: '', file: null, reminder_days: 10 });
        setEditingAdditionalDoc(null);
        setShowAdditionalDocForm(false);
        await loadClient();
        onSuccess();
        showToast('Document updated successfully', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update document';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setUploading(null);
      }
    } else {
      // Create new document (file optional)
      if (additionalDocForm.file) {
        // Create with file
        if (!currentUserName.trim()) {
          setError('User account information not available');
          showToast('Unable to identify user account. Please refresh the page.', 'error');
          return;
        }
        setUploading('additional');
        try {
          await api.uploadAdditionalDocument(
            client.id,
            additionalDocForm.name,
            additionalDocForm.description,
            additionalDocForm.file,
            currentUserName
          );
          setAdditionalDocForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowAdditionalDocForm(false);
          await loadClient();
          onSuccess();
          showToast('Additional document created successfully', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      } else {
        // Create without file (just name, description, reminder)
        setUploading('additional');
        try {
          await api.createAdditionalDocument(
            client.id,
            {
              name: additionalDocForm.name,
              description: additionalDocForm.description,
              reminder_days: additionalDocForm.reminder_days,
            }
          );
          setAdditionalDocForm({ name: '', description: '', file: null, reminder_days: 10 });
          setShowAdditionalDocForm(false);
          await loadClient();
          onSuccess();
          showToast('Document entry created successfully. You can upload the file later.', 'success');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create document';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setUploading(null);
        }
      }
    }
  };

  const handleRemoveAdditionalDocument = async (documentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Document',
      message: 'Are you sure you want to remove this document?',
      type: 'warning',
      onConfirm: async () => {
    setError('');
    try {
      await api.removeAdditionalDocument(client.id, documentId);
      await loadClient();
      onSuccess();
          showToast('Document removed successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error: any) {
      setError(error.message || 'Failed to remove document');
          showToast(error.message || 'Failed to remove document', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
      },
    });
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handleViewDocument = (fileUrl: string, fileName: string) => {
    // Handle relative URLs (if fileUrl starts with /uploads, it's relative to the server)
    let url = fileUrl;
    if (fileUrl.startsWith('/uploads/')) {
      // For relative paths, use the current origin
      url = window.location.origin + fileUrl;
    }
    // Always show document in modal
    setViewingDocument({ url, fileName });
  };

  const handleDownloadAllAsZip = async () => {
    setDownloadingZip(true);
    setError('');

    try {
      const zip = new JSZip();
      const clientName = `${clientData.first_name}_${clientData.last_name}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Collect all submitted required documents
      const submittedRequiredDocs = clientData.required_documents?.filter(
        (doc: RequiredDocument) => doc.submitted && doc.fileUrl
      ) || [];

      // Collect all additional documents
      const additionalDocs = clientData.additional_documents || [];

      if (submittedRequiredDocs.length === 0 && additionalDocs.length === 0) {
        setError('No documents available to download');
        setDownloadingZip(false);
        return;
      }

      // Fetch and add required documents
      for (const doc of submittedRequiredDocs) {
        try {
          const response = await fetch(doc.fileUrl!);
          const blob = await response.blob();
          const fileName = doc.fileName || `${doc.code || doc.name}.pdf`;
          zip.file(`Required_Documents/${fileName}`, blob);
        } catch (err) {
          console.error(`Failed to fetch ${doc.name}:`, err);
        }
      }

      // Fetch and add additional documents
      for (const doc of additionalDocs) {
        try {
          if (!doc.fileUrl) continue;
          const response = await fetch(doc.fileUrl);
          const blob = await response.blob();
          zip.file(`Additional_Documents/${doc.fileName}`, blob);
        } catch (err) {
          console.error(`Failed to fetch ${doc.name}:`, err);
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the ZIP file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${clientName}_documents_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error: any) {
      setError(error.message || 'Failed to create ZIP file');
      console.error('Error creating ZIP:', error);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSubmitToAdministrative = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Submit to Administrative Authority',
      message: 'Are you sure you want to submit this case to the administrative authority? This will start the administrative silence timer.',
      type: 'info',
      onConfirm: async () => {
    setError('');
    try {
      await api.submitToAdministrative(client.id);
      await loadClient();
      onSuccess();
          showToast('Case submitted to administrative authority successfully', 'success');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error: any) {
      setError(error.message || 'Failed to submit to administrative');
          showToast(error.message || 'Failed to submit to administrative', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
      },
    });
  };

  const handleDeleteClient = async () => {
    const confirmMessage = `Are you sure you want to delete ${clientData.first_name} ${clientData.last_name}? This action cannot be undone and will permanently remove all client data, documents, and records.`;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Client',
      message: confirmMessage,
      type: 'danger',
      onConfirm: async () => {
    setDeleting(true);
    setError('');
    try {
      await api.deleteClient(client.id);
          showToast(`Client ${clientData.first_name} ${clientData.last_name} deleted successfully`, 'success');
      onSuccess();
      onClose();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error: any) {
      setError(error.message || 'Failed to delete client');
          showToast(error.message || 'Failed to delete client', 'error');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
      setDeleting(false);
    }
      },
    });
  };
  
  // Count total submitted documents (including optional)
  const totalSubmittedDocs = (clientData.required_documents?.filter((d: any) => d.submitted).length || 0) + 
                              (clientData.additional_documents?.length || 0);

  // Calculate administrative silence countdown
  const calculateSilenceCountdown = () => {
    if (!clientData.submitted_to_immigration || !clientData.application_date) {
      return null;
    }

    const applicationDate = new Date(clientData.application_date);
    const silenceDays = clientData.administrative_silence_days || 60;
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[98vh] flex flex-col animate-scale-in my-2 sm:my-4 border border-gray-200/50 ring-1 ring-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {clientData.first_name} {clientData.last_name}
            </h2>
            <div className="mt-1.5 relative" ref={templateDropdownRef}>
              <div className="flex items-center gap-2">
                <p className="text-gray-600 text-sm sm:text-base font-medium">
                  {clientData.case_type || 'No template assigned'}
                </p>
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  title="Change template"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              {showTemplateDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-64">
                    {filteredTemplates.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No templates found</div>
                    ) : (
                      filteredTemplates.map((template) => {
                        const isSelected = selectedTemplate?.id === template.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateChange(template.id)}
                            disabled={savingTemplate}
                            className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors ${
                              isSelected ? 'bg-amber-100 border-l-4 border-amber-500' : ''
                            } ${savingTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              {template.name}
                              {isSelected && <CheckCircle className="w-4 h-4 text-amber-600" />}
                            </div>
                            {template.description && (
                              <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar smooth-scroll">
          <div className="p-6 space-y-6">

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm animate-slide-down shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

        {/* Administrative Submission Status */}
        {!clientData.submitted_to_immigration ? (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-base sm:text-lg">Not Submitted to Administrative Authority</h3>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">Submit the case to start the administrative silence timer</p>
                </div>
              </div>
              <button
                onClick={handleSubmitToAdministrative}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Submit to Administrative</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={`mb-6 p-5 rounded-xl border-2 shadow-md ${
            silenceInfo?.isExpired
              ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-300'
              : silenceInfo?.isExpiringSoon
              ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300'
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  silenceInfo?.isExpired
                    ? 'bg-red-100'
                    : silenceInfo?.isExpiringSoon
                    ? 'bg-orange-100'
                    : 'bg-emerald-100'
                }`}>
                  <Clock className={`w-6 h-6 ${
                    silenceInfo?.isExpired
                      ? 'text-red-600'
                      : silenceInfo?.isExpiringSoon
                      ? 'text-orange-600'
                      : 'text-emerald-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${
                    silenceInfo?.isExpired
                      ? 'text-red-900'
                      : silenceInfo?.isExpiringSoon
                      ? 'text-orange-900'
                      : 'text-emerald-900'
                  }`}>
                    Administrative Silence Timer Active
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm font-medium ${
                      silenceInfo?.isExpired
                        ? 'text-red-700'
                        : silenceInfo?.isExpiringSoon
                        ? 'text-orange-700'
                        : 'text-emerald-700'
                    }`}>
                      Submitted: {clientData.application_date ? new Date(clientData.application_date).toLocaleDateString() : 'N/A'}
                    </p>
                    {silenceInfo && (
                      <>
                        <p className={`text-sm font-medium ${
                          silenceInfo.isExpired
                            ? 'text-red-700'
                            : silenceInfo.isExpiringSoon
                            ? 'text-orange-700'
                            : 'text-emerald-700'
                        }`}>
                          {silenceInfo.isExpired
                            ? `Expired ${Math.abs(silenceInfo.daysRemaining)} days ago`
                            : silenceInfo.isExpiringSoon
                            ? `⚠️ Only ${silenceInfo.daysRemaining} days remaining`
                            : `${silenceInfo.daysRemaining} days remaining`}
                        </p>
                        <p className="text-xs text-slate-600">
                          Silence period ends: {silenceInfo.endDate.toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${
                silenceInfo?.isExpired
                  ? 'bg-red-100 text-red-700'
                  : silenceInfo?.isExpiringSoon
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {silenceInfo ? Math.abs(silenceInfo.daysRemaining) : '--'}
              </div>
            </div>
          </div>
        )}

        {/* Requested Documents Section - Only for submitted clients */}
        {clientData.submitted_to_immigration && (
          <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-purple-900">Requested Documents</h3>
                  <p className="text-sm text-purple-700">Documents requested by administration</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDurationModal(true)}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center space-x-1"
                  title="Set reminder duration"
                >
                  <Clock className="w-4 h-4" />
                  <span>{clientData.requested_documents_reminder_duration_days || 10} days</span>
                </button>
                <button
                  onClick={() => setShowRequestedDocForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Requested</span>
                </button>
              </div>
            </div>

            {/* Requested Documents Reminder Status */}
            {(() => {
              const requestedDocs = clientData.requested_documents || [];
              const pendingDocs = requestedDocs.filter((d: RequestedDocument) => !d.submitted);
              
              if (pendingDocs.length > 0) {
                const reminderInterval = clientData.requested_documents_reminder_interval_days || 3;
                const lastReminder = clientData.requested_documents_last_reminder_date 
                  ? new Date(clientData.requested_documents_last_reminder_date)
                  : null;
                const now = new Date();
                const daysSinceLastReminder = lastReminder 
                  ? Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24))
                  : Infinity;
                
                const needsReminder = !lastReminder || daysSinceLastReminder >= reminderInterval;
                
                return (
                  <div className={`mb-4 p-3 rounded-lg ${
                    needsReminder 
                      ? 'bg-orange-100 border border-orange-300' 
                      : 'bg-blue-100 border border-blue-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className={`w-5 h-5 ${needsReminder ? 'text-orange-600' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${needsReminder ? 'text-orange-800' : 'text-blue-800'}`}>
                          {needsReminder 
                            ? `Reminder due - ${pendingDocs.length} document(s) pending`
                            : `Next reminder in ${reminderInterval - daysSinceLastReminder} day(s)`}
                        </span>
                      </div>
                      {needsReminder && (
                        <button
                          onClick={async () => {
                            try {
                              await api.updateRequestedDocumentsLastReminder(clientData.id);
                              await loadClient();
                              showToast('Reminder date updated', 'success');
                            } catch (error: any) {
                              showToast(error.message || 'Failed to update reminder', 'error');
                            }
                          }}
                          className="px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition-colors"
                        >
                          Mark Reminded
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Requested Documents List */}
            {clientData.requested_documents && clientData.requested_documents.length > 0 ? (
              <div className="space-y-3">
                {clientData.requested_documents.map((doc: RequestedDocument) => (
                  <div key={doc.code} className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-900">{doc.name}</h4>
                          {doc.submitted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              ✓ Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                              ⚠ Pending
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-purple-700 mb-2">{doc.description}</p>
                        )}
                        {doc.requestedAt && (
                          <p className="text-xs text-purple-600">
                            Requested: {new Date(doc.requestedAt).toLocaleDateString()}
                          </p>
                        )}
                        {doc.submitted && doc.uploadedAt && (
                          <p className="text-xs text-emerald-600 mt-1">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {doc.submitted && doc.fileUrl ? (
                          <>
                            <button
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={doc.fileUrl}
                              download={doc.fileName}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Download document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        ) : (
                          <label className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadRequestedDocument(doc.code, file);
                                }
                              }}
                              disabled={uploadingRequestedDoc === doc.code}
                            />
                          </label>
                        )}
                        <button
                          onClick={() => handleRemoveRequestedDocument(doc.code)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-600">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No requested documents yet</p>
                <p className="text-xs mt-1">Add documents requested by administration</p>
              </div>
            )}
          </div>
        )}

        {/* Client Information */}
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <span>Client Information</span>
            </h3>
            {!editingClientInfo && (
              <button
                onClick={() => setEditingClientInfo(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
          
          {editingClientInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    id="client-first-name"
                    name="first_name"
                    required
                    value={clientInfoForm.first_name}
                    onChange={(e) => setClientInfoForm({ ...clientInfoForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    id="client-last-name"
                    name="last_name"
                    required
                    value={clientInfoForm.last_name}
                    onChange={(e) => setClientInfoForm({ ...clientInfoForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="client-email"
                    name="email"
                    value={clientInfoForm.email}
                    onChange={(e) => setClientInfoForm({ ...clientInfoForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Email (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    id="client-phone"
                    name="phone"
                    value={clientInfoForm.phone}
                    onChange={(e) => setClientInfoForm({ ...clientInfoForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Phone (optional)"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    id="client-parent-name"
                    name="parent_name"
                    value={clientInfoForm.parent_name}
                    onChange={(e) => setClientInfoForm({ ...clientInfoForm, parent_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Parent Name (optional)"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setEditingClientInfo(false);
                    setClientInfoForm({
                      first_name: clientData.first_name || '',
                      last_name: clientData.last_name || '',
                      email: clientData.email || '',
                      phone: clientData.phone || '',
                      parent_name: clientData.parent_name || '',
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={savingClientInfo}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClientInfo}
                  disabled={savingClientInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingClientInfo ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{clientData.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{clientData.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Parent Name:</span>
                <span className="ml-2 text-gray-900">{clientData.parent_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Payment:</span>
                <span className="ml-2 text-gray-900">
                  €{clientData.payment?.paidAmount || 0} / €{clientData.payment?.totalFee || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Documents Status:</span>
                <div className="ml-2 inline-flex items-center space-x-2">
                  <span className="text-gray-900 font-semibold">
                    {clientData.required_documents?.filter((d: any) => d.submitted).length || 0} / {clientData.required_documents?.length || 0}
                  </span>
                  {clientData.required_documents && clientData.required_documents.length > 0 && (
                    <>
                      <span className="text-emerald-600 text-xs font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{clientData.required_documents.filter((d: any) => d.submitted).length} submitted</span>
                      </span>
                      {clientData.required_documents.filter((d: any) => !d.submitted).length > 0 && (
                        <span className="text-red-600 text-xs font-medium flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{clientData.required_documents.filter((d: any) => !d.submitted).length} pending</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Client Details Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Client Details</h4>
              <button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingDetails ? 'Saving...' : 'Save Details'}
              </button>
            </div>
            <textarea
              id="client-details"
              name="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
              placeholder="Enter additional details about the client..."
            />
          </div>
        </div>

        {/* Payment Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-green-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          {(() => {
            const remainingAmount = (clientData.payment?.totalFee || 0) - (clientData.payment?.paidAmount || 0);
            return (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-700" />
                    </div>
                    <span>Payments</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    {remainingAmount > 0 && (
                      <button
                        onClick={handleOpenReminderCalendar}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                          customReminderDate
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={customReminderDate ? `Payment Reminder: ${new Date(customReminderDate).toLocaleDateString()}` : 'Set payment reminder'}
                      >
                        <Calendar className="w-4 h-4" />
                        {customReminderDate ? (
                          <span className="text-xs font-medium">
                            {new Date(customReminderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span>Payment Reminder</span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Payment</span>
                    </button>
                  </div>
                </div>

          {showPaymentForm && (
            <form onSubmit={handleAddPayment} className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
                  <input
                    type="number"
                    id="client-payment-amount"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    id="client-payment-method"
                    name="method"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <input
                    type="text"
                    id="client-payment-note"
                    name="note"
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Payment note"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentForm({ amount: '', method: 'Cash', note: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Payment
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Fee:</span>
                <span className="text-lg font-bold text-gray-900">€{clientData.payment?.totalFee || 0}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Paid Amount:</span>
                <span className="text-lg font-bold text-green-600">€{clientData.payment?.paidAmount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Remaining:</span>
                <span className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  €{remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>
            {clientData.payment?.payments && clientData.payment.payments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment History</h4>
                <div className="space-y-2">
                  {clientData.payment.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm bg-gray-50 p-2 sm:p-3 rounded">
                      <div>
                        <span className="font-medium">€{payment.amount}</span>
                        <span className="text-gray-600 ml-2">via {payment.method}</span>
                        {payment.note && <span className="text-gray-500 ml-2">- {payment.note}</span>}
                      </div>
                      <span className="text-gray-500">{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
              </>
            );
          })()}
        </div>

        {/* Required Documents */}
        <div className="mb-6 p-5 bg-gradient-to-br from-amber-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
                  <span>Required Documents</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {clientData.required_documents && clientData.required_documents.length > 0 && (
                    <>
                      {(() => {
                        const allDocuments = clientData.required_documents.map((d: any) => d.code);
                        const allSelected = allDocuments.length > 0 && 
                          allDocuments.every(code => selectedDocuments.has(code));
                        const allRequiredNonOptional = clientData.required_documents
                          .filter((d: any) => !d.isOptional)
                          .map((d: any) => d.code);
                        const allOptional = clientData.required_documents
                          .filter((d: any) => d.isOptional)
                          .map((d: any) => d.code);
                        const hasSelectedOptional = allOptional.some(code => selectedDocuments.has(code));
                        const hasSelectedRequired = allRequiredNonOptional.some(code => selectedDocuments.has(code));
                        const onlyOptionalSelected = hasSelectedOptional && !hasSelectedRequired;
                        const onlyRequiredSelected = hasSelectedRequired && !hasSelectedOptional;
                        return (
                          <>
                            <button
                              onClick={handleSelectAllDocuments}
                              className="px-2 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-1"
                              title={allSelected ? 'Deselect all' : 'Select all documents'}
                            >
                              <CheckSquare className="w-4 h-4" />
                              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                            </button>
                            {selectedDocuments.size > 0 && (
                              <>
                                {onlyRequiredSelected && (
                                  <button
                                    onClick={handleMakeSelectedOptional}
                                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center space-x-1"
                                    title={`Make selected document(s) optional`}
                                  >
                                    <ToggleRight className="w-4 h-4" />
                                    <span>Make Optional ({selectedDocuments.size})</span>
                                  </button>
                                )}
                                {onlyOptionalSelected && (
                                  <button
                                    onClick={handleMakeSelectedRequired}
                                    className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center space-x-1"
                                    title={`Make selected document(s) required`}
                                  >
                                    <ToggleLeft className="w-4 h-4" />
                                    <span>Make Required ({selectedDocuments.size})</span>
                                  </button>
                                )}
                                {hasSelectedRequired && hasSelectedOptional && (
                                  <>
                                    <button
                                      onClick={handleMakeSelectedOptional}
                                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center space-x-1"
                                      title={`Make selected document(s) optional`}
                                    >
                                      <ToggleRight className="w-4 h-4" />
                                      <span>Make Optional ({selectedDocuments.size})</span>
                                    </button>
                                    <button
                                      onClick={handleMakeSelectedRequired}
                                      className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center space-x-1"
                                      title={`Make selected document(s) required`}
                                    >
                                      <ToggleLeft className="w-4 h-4" />
                                      <span>Make Required ({selectedDocuments.size})</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Make All Documents Optional',
                                  message: 'Are you sure you want to mark all required documents as optional? This action cannot be undone.',
                                  type: 'warning',
                                  onConfirm: () => {
                                    handleMakeAllOptional();
                                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                                  },
                                });
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center space-x-1"
                              title="Make all documents optional"
                            >
                              <ToggleRight className="w-4 h-4" />
                              <span>Make All Optional</span>
                            </button>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
              {clientData.required_documents && clientData.required_documents.length > 0 && (
                <div className="flex items-center space-x-3 text-sm flex-wrap">
                  <span className="text-slate-600">
                    {clientData.required_documents.filter((d: any) => !d.isOptional && d.submitted).length} of {clientData.required_documents.filter((d: any) => !d.isOptional).length} required submitted
                  </span>
                  {clientData.required_documents.filter((d: any) => d.isOptional).length > 0 && (
                    <span className="text-blue-600 text-xs">
                      ({clientData.required_documents.filter((d: any) => d.isOptional).length} optional)
                    </span>
                  )}
                  <span className="text-emerald-600 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{clientData.required_documents.filter((d: any) => d.submitted).length}</span>
                  </span>
                  {clientData.required_documents.filter((d: any) => !d.isOptional && !d.submitted).length > 0 && (
                    <span className="text-red-600 flex items-center space-x-1">
                      <XCircle className="w-4 h-4" />
                      <span>{clientData.required_documents.filter((d: any) => !d.isOptional && !d.submitted).length} required pending</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {totalSubmittedDocs > 0 && (
              <button
                onClick={handleDownloadAllAsZip}
                disabled={downloadingZip}
                className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {downloadingZip ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Creating ZIP...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Download All ({totalSubmittedDocs})</span>
                  </>
                )}
              </button>
            )}
          </div>
          {!clientData.required_documents || clientData.required_documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents required for this client.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.required_documents.map((doc: RequiredDocument, index) => (
                <div
                  key={doc.code || index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-2 rounded-xl p-5 transition-all shadow-sm hover:shadow-md cursor-move ${
                    draggedIndex === index
                      ? 'opacity-50 border-blue-400 bg-blue-50'
                      : dragOverIndex === index
                      ? 'border-blue-400 bg-blue-50 scale-105'
                      : selectedDocuments.has(doc.code || '')
                      ? 'border-blue-400 bg-blue-50'
                      : doc.submitted
                      ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-white'
                      : doc.isOptional
                      ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                      : 'border-red-300 bg-gradient-to-br from-red-50 to-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mr-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDocumentSelection(doc.code || '');
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title={selectedDocuments.has(doc.code || '') ? 'Deselect' : 'Select'}
                      >
                        {selectedDocuments.has(doc.code || '') ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {doc.submitted ? (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-semibold text-base ${
                              doc.submitted ? 'text-slate-900' : 'text-red-900'
                            }`}>
                              {doc.name}
                            </h4>
                            {doc.isOptional && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                Optional
                              </span>
                            )}
                          </div>
                          {doc.submitted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mt-1">
                              ✓ Submitted
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                              doc.isOptional 
                                ? 'bg-gray-100 text-gray-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              ✗ Pending
                            </span>
                          )}
                        </div>
                      </div>
                      {doc.description && (
                        <p className={`text-sm mb-3 ml-11 ${
                          doc.submitted ? 'text-slate-600' : 'text-red-700/80'
                        }`}>
                          {doc.description}
                        </p>
                      )}
                      <div className="ml-11 space-y-1">
                        {doc.code && (
                          <p className={`text-xs font-medium ${
                            doc.submitted ? 'text-slate-500' : 'text-red-600/70'
                          }`}>
                            Code: <span className="font-mono">{doc.code}</span>
                          </p>
                        )}
                        {doc.submitted && doc.uploadedAt && (
                          <p className="text-xs text-slate-500">
                            Uploaded: <span className="font-medium">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        )}
                        {doc.submitted && doc.fileName && (
                          <p className="text-xs text-slate-500">
                            File: <span className="font-medium">{doc.fileName}</span> 
                            {doc.fileSize && (
                              <span className="text-slate-400"> ({`${(doc.fileSize / 1024).toFixed(2)} KB`})</span>
                            )}
                          </p>
                        )}
                        {!doc.submitted && (
                          <p className="text-xs font-medium text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Document not submitted</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleOptional(doc.code, doc.isOptional || false)}
                        className={`p-2 rounded-lg transition-colors border ${
                          doc.isOptional
                            ? 'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300'
                            : 'text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        title={doc.isOptional ? 'Mark as Required' : 'Mark as Optional'}
                      >
                        {doc.isOptional ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      {doc.submitted && doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName || 'document')}
                            className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName || 'document')}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveDocument(doc.code)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(doc.code, file);
                              }
                            }}
                            disabled={uploading === doc.code}
                          />
                          <div
                            className={`px-4 py-2.5 rounded-lg transition-all flex items-center space-x-2 font-medium text-sm ${
                              uploading === doc.code
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md hover:shadow-lg border border-red-700'
                            }`}
                          >
                            {uploading === doc.code ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Document</span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Documents */}
        <div className="mb-6 p-5 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
              <span>Additional Documents</span>
            </h3>
            <button
              onClick={() => setShowAdditionalDocForm(!showAdditionalDocForm)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {showAdditionalDocForm && (
            <form onSubmit={handleUploadAdditionalDocument} className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    id="additional-doc-name"
                    name="additional_doc_name"
                    required
                    value={additionalDocForm.name}
                    onChange={(e) => setAdditionalDocForm({ ...additionalDocForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g., Additional Certificate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    id="additional-doc-description"
                    name="additional_doc_description"
                    value={additionalDocForm.description}
                    onChange={(e) => setAdditionalDocForm({ ...additionalDocForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days (default: 10)</label>
                  <input
                    type="number"
                    id="additional-doc-reminder-days"
                    name="additional_doc_reminder_days"
                    min="1"
                    value={additionalDocForm.reminder_days}
                    onChange={(e) => setAdditionalDocForm({ ...additionalDocForm, reminder_days: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional - can upload later)</label>
                  <input
                    type="file"
                    id="additional-doc-file"
                    name="additional_doc_file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAdditionalDocForm({ ...additionalDocForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdditionalDocForm(false);
                    setAdditionalDocForm({ name: '', description: '', file: null, reminder_days: 10 });
                    setEditingAdditionalDoc(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading === 'additional'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading === 'additional' ? 'Saving...' : editingAdditionalDoc ? 'Update' : 'Create Document'}
                </button>
              </div>
            </form>
          )}

          {!clientData.additional_documents || clientData.additional_documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No additional documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.additional_documents.map((doc: AdditionalDocument) => (
                <div
                  key={doc.id}
                  className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && doc.fileName ? (
                        <>
                          <p className="text-xs text-gray-500">
                            File: {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'N/A'})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">File not uploaded yet</p>
                      )}
                      {!doc.fileUrl && doc.reminder_days && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Reminder: {doc.reminder_days} days</span>
                          {doc.reminder_date && (
                            <span className="text-gray-500">
                              (Due: {new Date(doc.reminder_date).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && currentUserName) {
                                  setUploading('additional');
                                  try {
                                    await api.uploadAdditionalDocumentFile(client.id, doc.id, file, currentUserName);
                                    await loadClient();
                                    onSuccess();
                                    showToast('File re-uploaded successfully', 'success');
                                  } catch (error: any) {
                                    showToast(error.message || 'Failed to re-upload file', 'error');
                                  } finally {
                                    setUploading(null);
                                  }
                                }
                              }}
                              disabled={uploading === 'additional'}
                            />
                            <div className="px-3 py-2 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Re-upload
                            </div>
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && currentUserName) {
                                setUploading('additional');
                                try {
                                  await api.uploadAdditionalDocumentFile(client.id, doc.id, file, currentUserName);
                                  await loadClient();
                                  onSuccess();
                                  showToast('File uploaded successfully', 'success');
                                } catch (error: any) {
                                  showToast(error.message || 'Failed to upload file', 'error');
                                } finally {
                                  setUploading(null);
                                }
                              }
                            }}
                            disabled={uploading === 'additional'}
                          />
                          <div className="px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors border border-purple-700">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Upload File
                          </div>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          setEditingAdditionalDoc(doc.id);
                          setAdditionalDocForm({
                            name: doc.name,
                            description: doc.description || '',
                            file: null,
                            reminder_days: doc.reminder_days || 10,
                          });
                          setShowAdditionalDocForm(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAdditionalDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JUSTIFICANTE DE PRESENTACION Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
              <span>JUSTIFICANTE DE PRESENTACION</span>
            </h3>
            <button
              onClick={() => setShowJustificanteForm(!showJustificanteForm)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {showJustificanteForm && (
            <form onSubmit={handleUploadJustificante} className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={justificanteForm.name}
                    onChange={(e) => setJustificanteForm({ ...justificanteForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g., Justificante de Presentación"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={justificanteForm.description}
                    onChange={(e) => setJustificanteForm({ ...justificanteForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days (default: 10)</label>
                  <input
                    type="number"
                    min="1"
                    value={justificanteForm.reminder_days}
                    onChange={(e) => setJustificanteForm({ ...justificanteForm, reminder_days: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional - can upload later)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setJustificanteForm({ ...justificanteForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJustificanteForm(false);
                    setJustificanteForm({ name: '', description: '', file: null, reminder_days: 10 });
                    setEditingJustificanteDoc(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading === 'justificante'}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading === 'justificante' ? 'Saving...' : editingJustificanteDoc ? 'Update' : 'Create Document'}
                </button>
              </div>
            </form>
          )}

          {!clientData.justificante_presentacion || clientData.justificante_presentacion.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.justificante_presentacion.map((doc: AdditionalDocument) => (
                <div
                  key={doc.id}
                  className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && doc.fileName ? (
                        <>
                          <p className="text-xs text-gray-500">
                            File: {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'N/A'})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">File not uploaded yet</p>
                      )}
                      {!doc.fileUrl && doc.reminder_days && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Reminder: {doc.reminder_days} days</span>
                          {doc.reminder_date && (
                            <span className="text-gray-500">
                              (Due: {new Date(doc.reminder_date).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && currentUserName) {
                                  setUploading('justificante');
                                  try {
                                    await api.uploadJustificanteFile(client.id, doc.id, file, currentUserName);
                                    await loadClient();
                                    onSuccess();
                                    showToast('File re-uploaded successfully', 'success');
                                  } catch (error: any) {
                                    showToast(error.message || 'Failed to re-upload file', 'error');
                                  } finally {
                                    setUploading(null);
                                  }
                                }
                              }}
                              disabled={uploading === 'justificante'}
                            />
                            <div className="px-3 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Re-upload
                            </div>
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && currentUserName) {
                                setUploading('justificante');
                                try {
                                  await api.uploadJustificanteFile(client.id, doc.id, file, currentUserName);
                                  await loadClient();
                                  onSuccess();
                                  showToast('File uploaded successfully', 'success');
                                } catch (error: any) {
                                  showToast(error.message || 'Failed to upload file', 'error');
                                } finally {
                                  setUploading(null);
                                }
                              }
                            }}
                            disabled={uploading === 'justificante'}
                          />
                          <div className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors border border-indigo-700">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Upload File
                          </div>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          setEditingJustificanteDoc(doc.id);
                          setJustificanteForm({
                            name: doc.name,
                            description: doc.description || '',
                            file: null,
                            reminder_days: doc.reminder_days || 10,
                          });
                          setShowJustificanteForm(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveJustificante(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APORTAR DOCUMENTACIÓN Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
              <span>APORTAR DOCUMENTACIÓN</span>
            </h3>
            <button
              onClick={() => setShowAportarDocForm(!showAportarDocForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {showAportarDocForm && (
            <form onSubmit={handleUploadAportarDocumentacion} className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    id="aportar-doc-name"
                    name="aportar_doc_name"
                    required
                    value={aportarDocForm.name}
                    onChange={(e) => setAportarDocForm({ ...aportarDocForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Additional Certificate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    id="aportar-doc-description"
                    name="aportar_doc_description"
                    value={aportarDocForm.description}
                    onChange={(e) => setAportarDocForm({ ...aportarDocForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days (default: 10)</label>
                  <input
                    type="number"
                    id="aportar-doc-reminder-days"
                    name="aportar_doc_reminder_days"
                    min="1"
                    value={aportarDocForm.reminder_days}
                    onChange={(e) => setAportarDocForm({ ...aportarDocForm, reminder_days: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional - can upload later)</label>
                  <input
                    type="file"
                    id="aportar-doc-file"
                    name="aportar_doc_file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAportarDocForm({ ...aportarDocForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAportarDocForm(false);
                    setAportarDocForm({ name: '', description: '', file: null, reminder_days: 10 });
                    setEditingAportarDoc(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading === 'aportar'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading === 'aportar' ? 'Saving...' : editingAportarDoc ? 'Update' : 'Create Document'}
                </button>
              </div>
            </form>
          )}

          {!clientData.aportar_documentacion || clientData.aportar_documentacion.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.aportar_documentacion.map((doc: AdditionalDocument) => (
                <div
                  key={doc.id}
                  className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && doc.fileName ? (
                        <>
                          <p className="text-xs text-gray-500">
                            File: {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'N/A'})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">File not uploaded yet</p>
                      )}
                      {!doc.fileUrl && doc.reminder_days && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Reminder: {doc.reminder_days} days</span>
                          {doc.reminder_date && (
                            <span className="text-gray-500">
                              (Due: {new Date(doc.reminder_date).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && currentUserName) {
                                  setUploading('aportar');
                                  try {
                                    await api.uploadAportarDocumentacionFile(client.id, doc.id, file, currentUserName);
                                    await loadClient();
                                    onSuccess();
                                    showToast('File re-uploaded successfully', 'success');
                                  } catch (error: any) {
                                    showToast(error.message || 'Failed to re-upload file', 'error');
                                  } finally {
                                    setUploading(null);
                                  }
                                }
                              }}
                              disabled={uploading === 'aportar'}
                            />
                            <div className="px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Re-upload
                            </div>
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && currentUserName) {
                                setUploading('aportar');
                                try {
                                  await api.uploadAportarDocumentacionFile(client.id, doc.id, file, currentUserName);
                                  await loadClient();
                                  onSuccess();
                                  showToast('File uploaded successfully', 'success');
                                } catch (error: any) {
                                  showToast(error.message || 'Failed to upload file', 'error');
                                } finally {
                                  setUploading(null);
                                }
                              }
                            }}
                            disabled={uploading === 'aportar'}
                          />
                          <div className="px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors border border-blue-700">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Upload File
                          </div>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          setEditingAportarDoc(doc.id);
                          setAportarDocForm({
                            name: doc.name,
                            description: doc.description || '',
                            file: null,
                            reminder_days: doc.reminder_days || 10,
                          });
                          setShowAportarDocForm(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAportarDocumentacion(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REQUERIMIENTO Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-amber-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
              <span>REQUERIMIENTO</span>
            </h3>
            <button
              onClick={() => setShowRequerimientoForm(!showRequerimientoForm)}
              className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {showRequerimientoForm && (
            <form onSubmit={handleUploadRequerimiento} className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={requerimientoForm.name}
                    onChange={(e) => setRequerimientoForm({ ...requerimientoForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="e.g., Requirement Document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={requerimientoForm.description}
                    onChange={(e) => setRequerimientoForm({ ...requerimientoForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days (default: 10)</label>
                  <input
                    type="number"
                    min="1"
                    value={requerimientoForm.reminder_days}
                    onChange={(e) => setRequerimientoForm({ ...requerimientoForm, reminder_days: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional - can upload later)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRequerimientoForm({ ...requerimientoForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequerimientoForm(false);
                    setRequerimientoForm({ name: '', description: '', file: null, reminder_days: 10 });
                    setEditingRequerimientoDoc(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading === 'requerimiento'}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading === 'requerimiento' ? 'Saving...' : editingRequerimientoDoc ? 'Update' : 'Create Document'}
                </button>
              </div>
            </form>
          )}

          {!clientData.requerimiento || clientData.requerimiento.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.requerimiento.map((doc: AdditionalDocument) => (
                <div
                  key={doc.id}
                  className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && doc.fileName ? (
                        <>
                          <p className="text-xs text-gray-500">
                            File: {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'N/A'})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">File not uploaded yet</p>
                      )}
                      {!doc.fileUrl && doc.reminder_days && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Reminder: {doc.reminder_days} days</span>
                          {doc.reminder_date && (
                            <span className="text-gray-500">
                              (Due: {new Date(doc.reminder_date).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && currentUserName) {
                                  setUploading('requerimiento');
                                  try {
                                    await api.uploadRequerimientoFile(client.id, doc.id, file, currentUserName);
                                    await loadClient();
                                    onSuccess();
                                    showToast('File re-uploaded successfully', 'success');
                                  } catch (error: any) {
                                    showToast(error.message || 'Failed to re-upload file', 'error');
                                  } finally {
                                    setUploading(null);
                                  }
                                }
                              }}
                              disabled={uploading === 'requerimiento'}
                            />
                            <div className="px-3 py-2 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Re-upload
                            </div>
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && currentUserName) {
                                setUploading('requerimiento');
                                try {
                                  await api.uploadRequerimientoFile(client.id, doc.id, file, currentUserName);
                                  await loadClient();
                                  onSuccess();
                                  showToast('File uploaded successfully', 'success');
                                } catch (error: any) {
                                  showToast(error.message || 'Failed to upload file', 'error');
                                } finally {
                                  setUploading(null);
                                }
                              }
                            }}
                            disabled={uploading === 'requerimiento'}
                          />
                          <div className="px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors border border-amber-700">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Upload File
                          </div>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          setEditingRequerimientoDoc(doc.id);
                          setRequerimientoForm({
                            name: doc.name,
                            description: doc.description || '',
                            file: null,
                            reminder_days: doc.reminder_days || 10,
                          });
                          setShowRequerimientoForm(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveRequerimiento(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESOLUCIÓN Section */}
        <div className="mb-6 p-5 bg-gradient-to-br from-green-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
              <span>RESOLUCIÓN</span>
            </h3>
            <button
              onClick={() => setShowResolucionForm(!showResolucionForm)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          {showResolucionForm && (
            <form onSubmit={handleUploadResolucion} className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={resolucionForm.name}
                    onChange={(e) => setResolucionForm({ ...resolucionForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g., Resolution Document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={resolucionForm.description}
                    onChange={(e) => setResolucionForm({ ...resolucionForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days (default: 10)</label>
                  <input
                    type="number"
                    min="1"
                    value={resolucionForm.reminder_days}
                    onChange={(e) => setResolucionForm({ ...resolucionForm, reminder_days: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (optional - can upload later)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResolucionForm({ ...resolucionForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResolucionForm(false);
                    setResolucionForm({ name: '', description: '', file: null, reminder_days: 10 });
                    setEditingResolucionDoc(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading === 'resolucion'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  {uploading === 'resolucion' ? 'Saving...' : editingResolucionDoc ? 'Update' : 'Create Document'}
                </button>
              </div>
            </form>
          )}

          {!clientData.resolucion || clientData.resolucion.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientData.resolucion.map((doc: AdditionalDocument) => (
                <div
                  key={doc.id}
                  className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                      {doc.fileUrl && doc.fileName ? (
                        <>
                          <p className="text-xs text-gray-500">
                            File: {doc.fileName} ({doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'N/A'})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            {doc.uploadedBy && (
                              <span className="ml-2">by <span className="font-medium">{doc.uploadedBy}</span></span>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium">File not uploaded yet</p>
                      )}
                      {!doc.fileUrl && doc.reminder_days && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Reminder: {doc.reminder_days} days</span>
                          {doc.reminder_date && (
                            <span className="text-gray-500">
                              (Due: {new Date(doc.reminder_date).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.fileUrl ? (
                        <>
                          <button
                            onClick={() => handleViewDocument(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.fileUrl!, doc.fileName!)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && currentUserName) {
                                  setUploading('resolucion');
                                  try {
                                    await api.uploadResolucionFile(client.id, doc.id, file, currentUserName);
                                    await loadClient();
                                    onSuccess();
                                    showToast('File re-uploaded successfully', 'success');
                                  } catch (error: any) {
                                    showToast(error.message || 'Failed to re-upload file', 'error');
                                  } finally {
                                    setUploading(null);
                                  }
                                }
                              }}
                              disabled={uploading === 'resolucion'}
                            />
                            <div className="px-3 py-2 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Re-upload
                            </div>
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && currentUserName) {
                                setUploading('resolucion');
                                try {
                                  await api.uploadResolucionFile(client.id, doc.id, file, currentUserName);
                                  await loadClient();
                                  onSuccess();
                                  showToast('File uploaded successfully', 'success');
                                } catch (error: any) {
                                  showToast(error.message || 'Failed to upload file', 'error');
                                } finally {
                                  setUploading(null);
                                }
                              }
                            }}
                            disabled={uploading === 'resolucion'}
                          />
                          <div className="px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors border border-green-700">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Upload File
                          </div>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          setEditingResolucionDoc(doc.id);
                          setResolucionForm({
                            name: doc.name,
                            description: doc.description || '',
                            file: null,
                            reminder_days: doc.reminder_days || 10,
                          });
                          setShowResolucionForm(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveResolucion(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section - Moved to end after all documents */}
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <StickyNote className="w-5 h-5 text-blue-700" />
              </div>
              <span>Important Notes</span>
            </h3>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Add important notes about this client..."
          />
        </div>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Client</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingDocument(null);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
                {viewingDocument.fileName}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(viewingDocument.url, viewingDocument.fileName)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {viewingDocument.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingDocument.url}
                  className="w-full h-full min-h-[600px] border-0 rounded-lg"
                  title={viewingDocument.fileName}
                />
              ) : viewingDocument.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
                <div className="flex items-center justify-center">
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
                  <FileText className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Preview not available</p>
                  <p className="text-sm mb-4">This file type cannot be previewed in the browser.</p>
                  <button
                    onClick={() => handleDownload(viewingDocument.url, viewingDocument.fileName)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to view</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Requested Document Modal */}
      {showRequestedDocForm && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRequestedDocForm(false);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-900">Add Requested Document</h3>
              <button
                onClick={() => setShowRequestedDocForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRequestedDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    value={requestedDocForm.name}
                    onChange={(e) => setRequestedDocForm({ ...requestedDocForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={requestedDocForm.description}
                    onChange={(e) => setRequestedDocForm({ ...requestedDocForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestedDocForm(false);
                    setRequestedDocForm({ name: '', description: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Reminder Duration Modal */}
      {showDurationModal && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDurationModal(false);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-900">Set Reminder Duration</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Reminders will be sent every 3 days</p>
                </div>
              </div>
              <button
                onClick={() => setShowDurationModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Reminders will be sent every 3 days until all requested documents are submitted</p>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDurationModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetReminderDuration}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Set Duration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Calendar Modal */}
      {showReminderCalendar && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReminderCalendar(false);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Payment Reminder</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Select a date to set a payment reminder</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReminderCalendar(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Reminder Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={tempReminderDate}
                      onChange={(e) => setTempReminderDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-base cursor-pointer"
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {!tempReminderDate && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Select a date to set a payment reminder for this client</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReminderCalendar(false);
                  setTempReminderDate('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReminderFromCalendar}
                disabled={!tempReminderDate || savingReminder}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {savingReminder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Reminder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
