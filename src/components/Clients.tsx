import { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Search, X } from 'lucide-react';
import { api } from '../utils/api';
import { Client } from '../types';
import CreateClientModal from './CreateClientModal';
import ClientDetailsModal from './ClientDetailsModal';
import ConfirmDialog from './ConfirmDialog';
import { showToast } from './Toast';
import { t } from '../utils/i18n';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ client: Client | null; isOpen: boolean }>({ client: null, isOpen: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    loadClients();
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

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening client details when clicking delete
    setDeleteConfirm({ client, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.client) return;
    
    try {
      await api.deleteClient(deleteConfirm.client.id);
      await loadClients();
      showToast(`Client ${deleteConfirm.client.first_name} ${deleteConfirm.client.last_name} deleted successfully`, 'success');
      setDeleteConfirm({ client: null, isOpen: false });
    } catch (error: any) {
      showToast(error.message || 'Failed to delete client', 'error');
      setDeleteConfirm({ client: null, isOpen: false });
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
    const email = (client.email || '').toLowerCase();
    const phone = (client.phone || '').toLowerCase();
    const caseType = (client.case_type || '').toLowerCase();
    const parentName = (client.parent_name || '').toLowerCase();
    
    return (
      fullName.startsWith(query) ||
      email.startsWith(query) ||
      phone.startsWith(query) ||
      caseType.startsWith(query) ||
      parentName.startsWith(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-amber-200/50 pb-4 sm:pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2 tracking-tight">{t('clients.title')}</h2>
          <p className="text-amber-700/80 text-base sm:text-lg font-medium">Manage your immigration clients and cases</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
          style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
        >
          <Plus className="w-5 h-5" />
          <span>New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
          <input
            type="text"
            placeholder="Search clients by name, email, phone, case type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-amber-900 placeholder-amber-400 bg-white/50 backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-amber-700/70">
            Found {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
          </p>
        )}
      </div>

      {filteredClients.length === 0 && clients.length > 0 ? (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center animate-scale-in">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent mb-2">No clients found</h3>
          <p className="text-amber-700/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">Try adjusting your search query</p>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            Clear Search
          </button>
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center animate-scale-in">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent mb-2">No clients yet</h3>
          <p className="text-amber-700/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">Create your first client to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            Create Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-1">
                    {client.first_name} {client.last_name}
                  </h3>
                  <p className="text-sm text-amber-700/70 font-medium">{client.case_type || t('clients.noTemplate')}</p>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-2 rounded-lg shadow-md">
                    <Users className="w-5 h-5 text-amber-800" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteClient(client, e)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-amber-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700/80">{t('clients.documents')}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-amber-900">
                      {client.required_documents?.filter((d: any) => d.submitted).length || 0}
                    </span>
                    <span className="text-amber-400">/</span>
                    <span className="text-sm font-semibold text-amber-700">
                      {client.required_documents?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700/80">{t('clients.payment')}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-bold text-emerald-700">
                      €{client.payment?.paidAmount || 0}
                    </span>
                    <span className="text-amber-400">/</span>
                    <span className="text-sm font-semibold text-amber-700">
                      €{client.payment?.totalFee || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadClients();
          }}
        />
      )}

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={() => {
            loadClients();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Client"
        message={deleteConfirm.client ? t('clients.deleteConfirm', { firstName: deleteConfirm.client.first_name, lastName: deleteConfirm.client.last_name }) : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ client: null, isOpen: false })}
      />
    </div>
  );
}

