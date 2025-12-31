import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit, FileText, Search, X } from 'lucide-react';
import { api } from '../utils/api';
import { CaseTemplate } from '../types';
import CreateTemplateModal from './CreateTemplateModal';
import ConfirmDialog from './ConfirmDialog';
import { showToast } from './Toast';
import { t } from '../utils/i18n';
import { SkeletonTemplateCard } from './Skeleton';
import { useData } from '../context/DataContext';

export default function Templates() {
  // Use cached templates from context (loaded once at app startup)
  const { templates: cachedTemplates, refreshTemplates } = useData();
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 25; // Load 25 items at a time
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CaseTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ templateId: string | null; templateName: string; isOpen: boolean }>({ templateId: null, templateName: '', isOpen: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // Initial load from cache (only once on mount)
  useEffect(() => {
    if (hasInitialized.current) return;
    if (searchQuery.trim()) return; // Don't initialize if searching
    
    if (cachedTemplates.length > 0) {
      // Use cached templates, paginate locally
      const initialTemplates = cachedTemplates.slice(0, LIMIT);
      setTemplates(initialTemplates);
      setTotal(cachedTemplates.length);
      setHasMore(cachedTemplates.length > LIMIT);
      setOffset(initialTemplates.length);
      setLoading(false);
      hasInitialized.current = true;
    } else {
      // If cache is empty on first load, make one API call
      loadTemplatesFromAPI(true);
      hasInitialized.current = true;
    }
  }, []); // Only run once on mount

  // Update from cache when it refreshes (after mutations) - but only if not searching
  useEffect(() => {
    if (!hasInitialized.current) return; // Wait for initial load
    if (searchQuery.trim()) return; // Don't update from cache if searching
    
    // Only update if cache length changed (indicates refresh after mutation)
    if (cachedTemplates.length > 0 && cachedTemplates.length !== total) {
      const initialTemplates = cachedTemplates.slice(0, LIMIT);
      setTemplates(initialTemplates);
      setTotal(cachedTemplates.length);
      setHasMore(cachedTemplates.length > LIMIT);
      setOffset(initialTemplates.length);
    }
  }, [cachedTemplates.length, total, searchQuery]); // Only depend on length, not the array itself

  // Load templates from API (only when needed: search or cache empty)
  const loadTemplatesFromAPI = useCallback(async (reset: boolean = true, searchTerm?: string) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentOffset = reset ? 0 : offset;
      const data = await api.getCaseTemplates(LIMIT, currentOffset, searchTerm);
      
      // Check if response has pagination structure
      if (data.templates && Array.isArray(data.templates)) {
        // Paginated response
        if (reset) {
          setTemplates(data.templates);
        } else {
          setTemplates(prev => [...prev, ...data.templates]);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
        setOffset(currentOffset + data.templates.length);
      } else if (Array.isArray(data)) {
        // Legacy response (all templates)
        setTemplates(data);
        setHasMore(false);
        setTotal(data.length);
        setOffset(data.length);
      }
      hasInitialized.current = true;
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    // Listen for language changes to force re-render
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
      // Cleanup search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleLoadMore = () => {
    if (searchQuery.trim()) {
      // If searching, load from API
      loadTemplatesFromAPI(false, searchQuery.trim());
    } else {
      // If not searching, load more from cache
      const nextTemplates = cachedTemplates.slice(offset, offset + LIMIT);
      if (nextTemplates.length > 0) {
        setTemplates(prev => [...prev, ...nextTemplates]);
        setOffset(offset + nextTemplates.length);
        setHasMore(offset + nextTemplates.length < cachedTemplates.length);
      }
    }
  };

  const handleDelete = (id: string) => {
    const template = templates.find(t => t.id === id);
    setDeleteConfirm({ templateId: id, templateName: template?.name || '', isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.templateId) return;
    
    try {
      await api.deleteCaseTemplate(deleteConfirm.templateId);
      await refreshTemplates(); // Refresh context - will trigger useEffect to update from cache
      // Reset pagination - useEffect will handle updating from refreshed cache
      hasInitialized.current = false;
      showToast(`Template "${deleteConfirm.templateName}" deleted successfully`, 'success');
      setDeleteConfirm({ templateId: null, templateName: '', isOpen: false });
    } catch (error) {
      showToast('Failed to delete template', 'error');
      setDeleteConfirm({ templateId: null, templateName: '', isOpen: false });
    }
  };

  // Use templates directly from API (already filtered by backend)
  const filteredTemplates = templates;

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-amber-200/50 pb-4 sm:pb-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-11 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonTemplateCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-amber-200/50 pb-4 sm:pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2 tracking-tight">{t('templates.title')}</h2>
          <p className="text-amber-700/80 text-base sm:text-lg font-medium">{t('templates.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
          style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
        >
          <Plus className="w-5 h-5" />
          <span>{t('templates.newTemplate')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
          <input
            type="text"
            placeholder="Search templates by name or description..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              
              // Clear existing timeout
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              
              // Debounce search: reload after 500ms of no typing
              searchTimeoutRef.current = setTimeout(() => {
                if (value.trim()) {
                  // Search requires API call
                  loadTemplatesFromAPI(true, value.trim());
                } else {
                  // Clear search - use cached data
                  const initialTemplates = cachedTemplates.slice(0, LIMIT);
                  setTemplates(initialTemplates);
                  setTotal(cachedTemplates.length);
                  setHasMore(cachedTemplates.length > LIMIT);
                  setOffset(initialTemplates.length);
                }
              }, 500);
            }}
            className="w-full pl-12 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-amber-900 placeholder-amber-400 bg-white/50 backdrop-blur-sm"
          />
          {searchQuery && (
            <button
            onClick={() => {
              setSearchQuery('');
              // Clear search - use cached data
              const initialTemplates = cachedTemplates.slice(0, LIMIT);
              setTemplates(initialTemplates);
              setTotal(cachedTemplates.length);
              setHasMore(cachedTemplates.length > LIMIT);
              setOffset(initialTemplates.length);
            }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-amber-700/70">
            Found {total} {total === 1 ? 'template' : 'templates'} {total > filteredTemplates.length ? `(showing ${filteredTemplates.length})` : ''}
          </p>
        )}
      </div>

      {filteredTemplates.length === 0 && templates.length > 0 ? (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center animate-scale-in">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent mb-2">{t('templates.noTemplates')}</h3>
          <p className="text-amber-700/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">Try adjusting your search query</p>
          <button
            onClick={() => {
              setSearchQuery('');
              // Clear search - use cached data
              const initialTemplates = cachedTemplates.slice(0, LIMIT);
              setTemplates(initialTemplates);
              setTotal(cachedTemplates.length);
              setHasMore(cachedTemplates.length > LIMIT);
              setOffset(initialTemplates.length);
            }}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            Clear Search
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="glass-gold rounded-xl sm:rounded-2xl p-8 sm:p-16 text-center animate-scale-in">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-700 bg-clip-text text-transparent mb-2">{t('templates.noTemplates')}</h3>
          <p className="text-amber-700/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">{t('templates.createFirstTemplate')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              onClick={() => setEditingTemplate(template)}
              className="glass-gold rounded-xl sm:rounded-2xl p-4 sm:p-6 glass-hover animate-slide-up cursor-pointer transition-all duration-200 hover:shadow-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-amber-700/70 line-clamp-2 font-medium">{template.description}</p>
                  )}
                </div>
                <div className="flex space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Edit template"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-amber-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700/80">{t('templates.documents')}</span>
                  <span className="text-sm font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-lg shadow-md">
                    {template.required_documents.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700/80">{t('templates.reminderInterval')}</span>
                  <span className="text-sm font-semibold text-amber-800">
                    {template.reminder_interval_days} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-700/80">{t('templates.adminSilence')}</span>
                  <span className="text-sm font-semibold text-amber-800">
                    {template.administrative_silence_days} days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!searchQuery && hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-amber-900 px-8 py-3 rounded-xl font-semibold hover:shadow-2xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-900"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <span className="text-sm opacity-75">({total - templates.length} remaining)</span>
              </>
            )}
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            await refreshTemplates(); // Refresh context - will trigger useEffect to update from cache
            // Reset pagination - useEffect will handle updating from refreshed cache
            hasInitialized.current = false;
          }}
        />
      )}

      {editingTemplate && (
        <CreateTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={async () => {
            setEditingTemplate(null);
            await refreshTemplates(); // Refresh context - will trigger useEffect to update from cache
            // Reset pagination - useEffect will handle updating from refreshed cache
            hasInitialized.current = false;
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Template"
        message={deleteConfirm.templateName ? t('templates.deleteConfirm', { name: deleteConfirm.templateName }) : t('templates.deleteConfirmNoName')}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ templateId: null, templateName: '', isOpen: false })}
      />
    </div>
  );
}

