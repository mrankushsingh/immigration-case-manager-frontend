import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import { CaseTemplate } from '../types';
import { showToast } from './Toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateClientModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    parentName: '',
    email: '',
    phone: '',
    caseTemplateId: '',
    totalFee: '',
    details: '',
  });
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Close dropdown when clicking outside
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

  const filteredTemplates = templates.filter((template) => {
    if (!templateSearchQuery.trim()) return true;
    const query = templateSearchQuery.toLowerCase();
    const name = (template.name || '').toLowerCase();
    const description = (template.description || '').toLowerCase();
    
    return name.startsWith(query) || description.startsWith(query);
  });

  const selectedTemplate = templates.find(t => t.id === formData.caseTemplateId);

  const loadTemplates = async () => {
    try {
      const data = await api.getCaseTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      await api.createClient({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        parentName: formData.parentName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        caseTemplateId: formData.caseTemplateId || undefined,
        totalFee: formData.totalFee ? parseFloat(formData.totalFee) : undefined,
        details: formData.details.trim() || undefined,
      });
      showToast(`Client ${formData.firstName} ${formData.lastName} created successfully`, 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create client';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={(e) => {
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[98vh] flex flex-col animate-scale-in my-2 sm:my-4 border border-gray-200/50">
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">New Client</h2>
              <p className="text-sm text-gray-600 mt-0.5">Add a new client to the system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/80 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar smooth-scroll">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm animate-slide-down shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form id="create-client-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Information Section */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <span>Contact Information</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                      placeholder="Parent's full name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Information Section */}
              <div className="p-5 bg-gradient-to-br from-amber-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
                  <span>Case Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative" ref={templateDropdownRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Case Template</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md bg-white text-left flex items-center justify-between"
                      >
                        <span className={selectedTemplate ? 'text-gray-900' : 'text-gray-500'}>
                          {selectedTemplate ? selectedTemplate.name : 'Select a template (optional)'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTemplateDropdown ? 'transform rotate-180' : ''}`} />
                      </button>
                      
                      {showTemplateDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-hidden flex flex-col">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={templateSearchQuery}
                                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                placeholder="Search templates..."
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Template List */}
                          <div className="overflow-y-auto max-h-48">
                            {filteredTemplates.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No templates found
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, caseTemplateId: '' });
                                    setShowTemplateDropdown(false);
                                    setTemplateSearchQuery('');
                                  }}
                                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                                    !formData.caseTemplateId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  None (optional)
                                </button>
                                {filteredTemplates.map((template) => (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, caseTemplateId: template.id });
                                      setShowTemplateDropdown(false);
                                      setTemplateSearchQuery('');
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                                      formData.caseTemplateId === template.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                                  >
                                    <div className="font-medium">{template.name}</div>
                                    {template.description && (
                                      <div className="text-xs text-gray-500 mt-0.5 truncate">{template.description}</div>
                                    )}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Fee (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalFee}
                      onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="p-5 bg-gradient-to-br from-purple-50/50 to-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  <span>Additional Details</span>
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Details</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm hover:shadow-md"
                    placeholder="Enter additional details about the client..."
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-client-form"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Client</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

