// Use environment variable in production, relative path in development
// Remove trailing slash to prevent double slashes in URLs
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Try to get Firebase ID token
  try {
    const { getIdToken, getCurrentUser } = await import('./firebase.js');
    const user = getCurrentUser();
    
    if (!user) {
      console.warn('⚠️  No authenticated user found. User must be logged in to access API.');
      throw new Error('User not authenticated. Please log in.');
    }
    
    const token = await getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.error('❌ Failed to get ID token. User may not be authenticated.');
      throw new Error('Failed to get authentication token. Please log in again.');
    }
  } catch (error: any) {
    console.error('❌ Authentication error:', error.message || error);
    // Re-throw to let calling code handle it
    throw new Error(error.message || 'Authentication required. Please log in.');
  }
  
  return headers;
}

export const api = {
  async getCaseTemplates() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/case-templates`, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch templates' }));
      console.error('❌ getCaseTemplates error:', {
        status: response.status,
        statusText: response.statusText,
        error: error.error || error.message,
      });
      throw new Error(error.error || error.message || `Failed to fetch templates: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async createCaseTemplate(data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/case-templates`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create template' }));
      throw new Error(error.error || error.details || 'Failed to create template');
    }
    return response.json();
  },

  async updateCaseTemplate(id: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/case-templates/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  },

  async deleteCaseTemplate(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/case-templates/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return response.json();
  },

  async getClients() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/clients`, {
        headers,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch clients' }));
        console.error('❌ getClients error:', {
          status: response.status,
          statusText: response.statusText,
          error: error.error || error.message,
        });
        throw new Error(error.error || error.message || `Failed to fetch clients: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      if (error.message.includes('Authentication') || error.message.includes('log in')) {
        throw error; // Re-throw auth errors
      }
      throw error;
    }
  },

  async getClient(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${id}`, {
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json();
  },

  async createClient(data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create client' }));
      throw new Error(error.error || error.message || 'Failed to create client');
    }
    return response.json();
  },

  async updateClient(id: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
  },

  async uploadDocument(clientId: string, documentCode: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);

    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/clients/${clientId}/documents/${documentCode}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload document' }));
      throw new Error(error.error || 'Failed to upload document');
    }

    return response.json();
  },

  async addPayment(clientId: string, amount: number, method: string, note?: string) {
    const client = await this.getClient(clientId);
    const newPayment = {
      amount,
      date: new Date().toISOString(),
      method,
      note: note || undefined,
    };
    
    const updatedPayments = [...(client.payment.payments || []), newPayment];
    const newPaidAmount = (client.payment.paidAmount || 0) + amount;

    return this.updateClient(clientId, {
      payment: {
        ...client.payment,
        paidAmount: newPaidAmount,
        payments: updatedPayments,
      },
    });
  },

  async updateNotes(clientId: string, notes: string) {
    return this.updateClient(clientId, { notes });
  },

  async uploadAdditionalDocument(clientId: string, name: string, description: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('userName', userName);
    if (description) {
      formData.append('description', description);
    }

    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/clients/${clientId}/additional-documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload additional document' }));
      throw new Error(error.error || 'Failed to upload additional document');
    }

    return response.json();
  },

  async createAdditionalDocument(clientId: string, data: { name: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/additional-documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create document' }));
      throw new Error(error.error || 'Failed to create document');
    }

    return response.json();
  },

  async updateAdditionalDocument(clientId: string, documentId: string, data: { name?: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/additional-documents/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
      throw new Error(error.error || 'Failed to update document');
    }

    return response.json();
  },

  async uploadAdditionalDocumentFile(clientId: string, documentId: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);

    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/clients/${clientId}/additional-documents/${documentId}/file`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  },

  async removeDocument(clientId: string, documentCode: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/documents/${documentCode}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove document' }));
      throw new Error(error.error || 'Failed to remove document');
    }

    return response.json();
  },

  async removeAdditionalDocument(clientId: string, documentId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/additional-documents/${documentId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove additional document' }));
      throw new Error(error.error || 'Failed to remove additional document');
    }

    return response.json();
  },

  // Requested Documents (only for submitted clients)
  async addRequestedDocument(clientId: string, data: { name: string; description?: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requested-documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to add requested document' }));
      throw new Error(error.error || 'Failed to add requested document');
    }
    return response.json();
  },

  async uploadRequestedDocument(clientId: string, documentCode: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    const headers = await getAuthHeaders();
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete (headers as any)['Content-Type'];
    const response = await fetch(`${API_URL}/clients/${clientId}/requested-documents/${documentCode}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload requested document' }));
      throw new Error(error.error || 'Failed to upload requested document');
    }
    return response.json();
  },

  async removeRequestedDocument(clientId: string, documentCode: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requested-documents/${documentCode}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove requested document' }));
      throw new Error(error.error || 'Failed to remove requested document');
    }
    return response.json();
  },

  async setRequestedDocumentsReminderDuration(clientId: string, durationDays: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requested-documents-reminder-duration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ durationDays }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update reminder duration' }));
      throw new Error(error.error || 'Failed to update reminder duration');
    }
    return response.json();
  },

  async updateRequestedDocumentsLastReminder(clientId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requested-documents-last-reminder`, {
      method: 'PUT',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update last reminder date' }));
      throw new Error(error.error || 'Failed to update last reminder date');
    }
    return response.json();
  },

  // APORTAR DOCUMENTACIÓN
  async uploadAportarDocumentacion(clientId: string, name: string, description: string, file: File, userName: string, reminder_days?: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('userName', userName);
    if (description) {
      formData.append('description', description);
    }
    if (reminder_days) {
      formData.append('reminder_days', reminder_days.toString());
    }
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/aportar-documentacion`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload document' }));
      throw new Error(error.error || 'Failed to upload document');
    }
    return response.json();
  },

  async createAportarDocumentacion(clientId: string, data: { name: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/aportar-documentacion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create document' }));
      throw new Error(error.error || 'Failed to create document');
    }
    return response.json();
  },

  async updateAportarDocumentacion(clientId: string, documentId: string, data: { name?: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/aportar-documentacion/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
      throw new Error(error.error || 'Failed to update document');
    }
    return response.json();
  },

  async uploadAportarDocumentacionFile(clientId: string, documentId: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/aportar-documentacion/${documentId}/file`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  },

  async removeAportarDocumentacion(clientId: string, documentId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/aportar-documentacion/${documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove document' }));
      throw new Error(error.error || 'Failed to remove document');
    }
    return response.json();
  },

  // REQUERIMIENTO
  async uploadRequerimiento(clientId: string, name: string, description: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('userName', userName);
    if (description) {
      formData.append('description', description);
    }
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/requerimiento`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload document' }));
      throw new Error(error.error || 'Failed to upload document');
    }
    return response.json();
  },

  async createRequerimiento(clientId: string, data: { name: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requerimiento`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create document' }));
      throw new Error(error.error || 'Failed to create document');
    }
    return response.json();
  },

  async updateRequerimiento(clientId: string, documentId: string, data: { name?: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requerimiento/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
      throw new Error(error.error || 'Failed to update document');
    }
    return response.json();
  },

  async uploadRequerimientoFile(clientId: string, documentId: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/requerimiento/${documentId}/file`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  },

  async removeRequerimiento(clientId: string, documentId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/requerimiento/${documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove document' }));
      throw new Error(error.error || 'Failed to remove document');
    }
    return response.json();
  },

  // RESOLUCIÓN
  async uploadResolucion(clientId: string, name: string, description: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('userName', userName);
    if (description) {
      formData.append('description', description);
    }
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/resolucion`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload document' }));
      throw new Error(error.error || 'Failed to upload document');
    }
    return response.json();
  },

  async createResolucion(clientId: string, data: { name: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/resolucion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create document' }));
      throw new Error(error.error || 'Failed to create document');
    }
    return response.json();
  },

  async updateResolucion(clientId: string, documentId: string, data: { name?: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/resolucion/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
      throw new Error(error.error || 'Failed to update document');
    }
    return response.json();
  },

  async uploadResolucionFile(clientId: string, documentId: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/resolucion/${documentId}/file`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  },

  async removeResolucion(clientId: string, documentId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/resolucion/${documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove document' }));
      throw new Error(error.error || 'Failed to remove document');
    }
    return response.json();
  },

  // JUSTIFICANTE DE PRESENTACION
  async createJustificante(clientId: string, data: { name: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/justificante-presentacion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create document' }));
      throw new Error(error.error || 'Failed to create document');
    }
    return response.json();
  },

  async updateJustificante(clientId: string, documentId: string, data: { name?: string; description?: string; reminder_days?: number }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/justificante-presentacion/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update document' }));
      throw new Error(error.error || 'Failed to update document');
    }
    return response.json();
  },

  async uploadJustificanteFile(clientId: string, documentId: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/justificante-presentacion/${documentId}/file`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload file' }));
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  },

  async uploadJustificante(clientId: string, name: string, description: string, file: File, userName: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('userName', userName);
    if (description) {
      formData.append('description', description);
    }
    const token = await (await import('./firebase.js')).getIdToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/clients/${clientId}/justificante-presentacion`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload document' }));
      throw new Error(error.error || 'Failed to upload document');
    }
    return response.json();
  },

  async removeJustificante(clientId: string, documentId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${clientId}/justificante-presentacion/${documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove document' }));
      throw new Error(error.error || 'Failed to remove document');
    }
    return response.json();
  },

  async submitToAdministrative(clientId: string) {
    return this.updateClient(clientId, {
      submitted_to_immigration: true,
      application_date: new Date().toISOString(),
    });
  },

  async deleteClient(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete client');
    return response.json();
  },

  // User management
  async getUsers() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch users' }));
      throw new Error(error.error || 'Failed to fetch users');
    }
    return response.json();
  },

  async getCurrentUser() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch current user' }));
      throw new Error(error.error || 'Failed to fetch current user');
    }
    return response.json();
  },

  async getUser(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch user' }));
      throw new Error(error.error || 'Failed to fetch user');
    }
    return response.json();
  },

  async createUser(data: { email: string; name?: string; role: 'admin' | 'user'; firebase_uid: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create user' }));
      throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
  },

  async updateUser(id: string, data: { email?: string; name?: string; role?: 'admin' | 'user'; active?: boolean }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update user' }));
      throw new Error(error.error || 'Failed to update user');
    }
    return response.json();
  },

  async deleteUser(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete user' }));
      throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
  },

  async exportAllData(): Promise<Blob> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/export/all`, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to export data' }));
      throw new Error(error.error || 'Failed to export data');
    }
    return response.blob();
  },

  async importAllData(file: File): Promise<{ message: string; results: any }> {
    const headers = await getAuthHeaders();
    
    // Read file as JSON
    const fileContent = await file.text();
    let importData: any;
    try {
      importData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error('Invalid JSON file format');
    }

    const response = await fetch(`${API_URL}/users/import/all`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: importData }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to import data' }));
      throw new Error(error.error || 'Failed to import data');
    }

    return response.json();
  },

  // Settings API
  async getPaymentPasscodeStatus() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/settings/payment-passcode`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get payment passcode status' }));
      throw new Error(error.error || 'Failed to get payment passcode status');
    }
    return response.json();
  },

  async setPaymentPasscode(passcode: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/settings/payment-passcode`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ passcode }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to set payment passcode' }));
      throw new Error(error.error || 'Failed to set payment passcode');
    }
    return response.json();
  },

  async verifyPaymentPasscode(passcode: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/settings/payment-passcode/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ passcode }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to verify passcode' }));
      throw new Error(error.error || 'Failed to verify passcode');
    }
    return response.json();
  },

  // Reminders API
  async getReminders() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/reminders`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get reminders' }));
      throw new Error(error.error || 'Failed to get reminders');
    }
    return response.json();
  },

  async createReminder(data: {
    client_id: string;
    client_name: string;
    client_surname: string;
    phone?: string;
    reminder_date: string;
    notes?: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create reminder' }));
      throw new Error(error.error || 'Failed to create reminder');
    }
    return response.json();
  },

  async updateReminder(id: string, data: {
    client_id?: string;
    client_name?: string;
    client_surname?: string;
    phone?: string;
    reminder_date?: string;
    notes?: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update reminder' }));
      throw new Error(error.error || 'Failed to update reminder');
    }
    return response.json();
  },

  async deleteReminder(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete reminder' }));
      throw new Error(error.error || 'Failed to delete reminder');
    }
    return response.json();
  },

  async getPaymentsSummary(month?: number, year?: number) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = `${API_URL}/analytics/payments-summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch payments summary' }));
      throw new Error(error.error || 'Failed to fetch payments summary');
    }
    return response.json();
  },

  async getMonthlySummary(month?: number, year?: number) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = `${API_URL}/analytics/monthly-summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch monthly summary' }));
      throw new Error(error.error || 'Failed to fetch monthly summary');
    }
    return response.json();
  },

  async getMonthlyTrend(months: number = 6) {
    const headers = await getAuthHeaders();
    const url = `${API_URL}/analytics/monthly-trend?months=${months}`;
    
    const response = await fetch(url, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch monthly trend' }));
      throw new Error(error.error || 'Failed to fetch monthly trend');
    }
    return response.json();
  },

  async copyDatabase(sourceUrl: string, destinationUrl: string, skipDuplicates: boolean = true): Promise<{ message: string; results: any }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/copy-database`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceUrl, destinationUrl, skipDuplicates }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to copy database' }));
      throw new Error(error.error || 'Failed to copy database');
    }

    return response.json();
  },
};

