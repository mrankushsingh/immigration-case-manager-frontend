export interface CaseTemplate {
  id: string;
  name: string;
  description?: string;
  required_documents: RequiredDocument[];
  reminder_interval_days: number;
  administrative_silence_days: number;
  created_at: string;
  updated_at: string;
}

export interface RequiredDocument {
  code: string;
  name: string;
  description?: string;
  submitted?: boolean;
  fileUrl?: string;
  uploadedAt?: string;
  fileName?: string;
  fileSize?: number;
  isOptional?: boolean; // If true, document is optional for this client
  uploadedBy?: string; // Name of the user who uploaded the file
}

export interface RequestedDocument {
  code: string;
  name: string;
  description?: string;
  submitted?: boolean;
  fileUrl?: string;
  uploadedAt?: string;
  fileName?: string;
  fileSize?: number;
  requestedAt?: string; // When the document was requested by administration
  uploadedBy?: string; // Name of the user who uploaded the file
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  parent_name?: string;
  email?: string;
  phone?: string;
  case_template_id?: string;
  case_type?: string;
  details?: string;
  required_documents: RequiredDocument[];
  reminder_interval_days: number;
  administrative_silence_days: number;
  payment: PaymentInfo;
  submitted_to_immigration: boolean;
  application_date?: string;
  custom_reminder_date?: string; // Custom reminder date set by team
  notifications: Notification[];
  additional_docs_required: boolean;
  notes?: string;
  additional_documents?: AdditionalDocument[];
  requested_documents?: RequestedDocument[]; // Documents requested by administration
  requested_documents_reminder_duration_days?: number; // Duration for requested documents (default 10)
  requested_documents_reminder_interval_days?: number; // Reminder interval for requested documents (default 3)
  requested_documents_last_reminder_date?: string; // Last reminder date for requested documents
  aportar_documentacion?: AdditionalDocument[]; // APORTAR DOCUMENTACIÓN documents
  requerimiento?: AdditionalDocument[]; // REQUERIMIENTO documents
  resolucion?: AdditionalDocument[]; // RESOLUCIÓN documents
  justificante_presentacion?: AdditionalDocument[]; // JUSTIFICANTE DE PRESENTACION documents
  created_at: string;
  updated_at: string;
}

export interface PaymentInfo {
  totalFee: number;
  paidAmount: number;
  payments: Payment[];
}

export interface Payment {
  amount: number;
  date: string;
  method: string;
  note?: string;
}

export interface Notification {
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdditionalDocument {
  id: string;
  name: string;
  description?: string;
  fileUrl?: string; // Optional - file can be uploaded later
  fileName?: string; // Optional - file can be uploaded later
  fileSize?: number; // Optional - file can be uploaded later
  uploadedAt?: string; // Optional - only set when file is uploaded
  uploadedBy?: string; // Name of the user who uploaded the file
  reminder_days?: number; // Reminder days (default 10)
  reminder_date?: string; // Calculated reminder date (ISO string)
  created_at?: string; // When document entry was created
}

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  client_id: string;
  client_name: string;
  client_surname: string;
  phone?: string;
  reminder_date: string; // ISO date string
  notes?: string;
  reminder_type?: string; // 'REQUERIMIENTO', 'RECORDATORIO', etc.
  created_at: string;
  updated_at: string;
}

