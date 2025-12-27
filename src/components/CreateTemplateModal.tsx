import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { RequiredDocument, CaseTemplate } from '../types';
import { showToast } from './Toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  template?: CaseTemplate;
}

// Predefined document names for autocomplete suggestions
const PREDEFINED_DOCUMENT_NAMES = [
  'Pasaporte en vigor',
  'Copia completa del pasaporte',
  'Pasaporte anterior',
  'Tarjeta de residencia TIE',
  'Certificado histórico de empadronamiento',
  'Certificado de convivencia',
  'Certificado histórico de convivencia',
  'Certificación de haber superado estudios',
  'Acreditación de capacitación profesional',
  'Titulación homologada',
  'Certificado de antecedentes penales',
  'Certificado de antecedentes penales del país de origen',
  'Certificado médico',
  'Documentación acreditativa de permanencia en España',
  'Seguro de salud público',
  'Seguro médico privado',
  'Informe de vida laboral',
  'Medios económicos del solicitante',
  'Extractos bancarios',
  'Contrato de trabajo',
  'Últimas seis nóminas',
  'Declaración IRPF',
  'Copia del DNI del ciudadano español',
  'Copia del pasaporte o DNI del ciudadano UE',
  'Certificado de registro de ciudadano UE (NIE verde)',
  'Fe de vida y estado',
  'Sentencia firme de divorcio',
  'Escritura de constitución de pareja estable',
  'Inscripción en el Registro de Parejas Estables de Cataluña',
  'Certificado de matrimonio',
  'Certificado de nacimiento del hijo',
  'Certificado de nacimiento (ascendientes o descendientes)',
  'Autorización del otro progenitor',
  'Libro de familia',
  'Documentación acreditativa de parentesco',
  'Documentación acreditativa de estar a cargo',
  'Documentación acreditativa de grado de dependencia',
  'Volante de empadronamiento del solicitante y pareja',
  'Contrato de trabajo firmado por ambas partes',
  'Copia del DNI o TIE del empleador',
  'Certificado de convivencia del empleador',
  'Acreditación de solvencia económica del empleador',
  'Declaración IRPF del empleador',
  'Declaración trimestral del IVA del empleador',
  'Certificado de estar al corriente en Seguridad Social',
  'Certificado de estar al corriente en Agencia Tributaria',
  'Certificado bancario de saldo',
  'Alta de autónomos (Seguridad Social y AEAT)',
  'Declaraciones IVA',
  'Tres últimas nóminas',
  'Memoria descriptiva de la ocupación',
  'Otra documentación del despacho',
];

export default function CreateTemplateModal({ onClose, onSuccess, template }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reminderIntervalDays: '10',
    administrativeSilenceDays: '60',
  });
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allDocumentNames, setAllDocumentNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{ name: string; index: number }[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        reminderIntervalDays: template.reminder_interval_days.toString(),
        administrativeSilenceDays: template.administrative_silence_days.toString(),
      });
      setRequiredDocuments(template.required_documents || []);
    }
    
    // Load all document names from existing templates and merge with predefined names
    const loadDocumentNames = async () => {
      try {
        const templates = await api.getCaseTemplates();
        const documentNames = new Set<string>(PREDEFINED_DOCUMENT_NAMES);
        
        // Add document names from existing templates
        templates.forEach((t: CaseTemplate) => {
          t.required_documents?.forEach((doc: RequiredDocument) => {
            if (doc.name && doc.name.trim()) {
              documentNames.add(doc.name.trim());
            }
          });
        });
        
        setAllDocumentNames(Array.from(documentNames).sort());
      } catch (error) {
        console.error('Failed to load document names:', error);
        // Fallback to predefined names only
        setAllDocumentNames([...PREDEFINED_DOCUMENT_NAMES].sort());
      }
    };
    
    loadDocumentNames();
  }, [template]);

  const addDocument = () => {
    setRequiredDocuments([
      ...requiredDocuments,
      {
        code: `DOC_${requiredDocuments.length + 1}`,
        name: '',
        description: '',
      },
    ]);
  };

  const removeDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof RequiredDocument, value: string) => {
    const updated = [...requiredDocuments];
    updated[index] = { ...updated[index], [field]: value };
    setRequiredDocuments(updated);
    
    // Show suggestions when typing document name
    if (field === 'name' && value.trim()) {
      const query = value.toLowerCase().trim();
      const filtered = allDocumentNames
        .filter(name => name.toLowerCase().includes(query) && name.toLowerCase() !== query)
        .slice(0, 5)
        .map(name => ({ name, index }));
      setSuggestions(filtered);
      setActiveSuggestionIndex(filtered.length > 0 ? 0 : null);
    } else if (field === 'name' && !value.trim()) {
      setSuggestions([]);
      setActiveSuggestionIndex(null);
    }
  };

  const selectSuggestion = (index: number, suggestionName: string) => {
    const updated = [...requiredDocuments];
    updated[index] = { ...updated[index], name: suggestionName };
    setRequiredDocuments(updated);
    setSuggestions([]);
    setActiveSuggestionIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    const validDocuments = requiredDocuments.filter((doc) => doc.name.trim() !== '');

    setLoading(true);
    try {
      if (template) {
        // Edit mode
        await api.updateCaseTemplate(template.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          requiredDocuments: validDocuments,
          reminderIntervalDays: parseInt(formData.reminderIntervalDays) || 10,
          administrativeSilenceDays: parseInt(formData.administrativeSilenceDays) || 60,
        });
        showToast(`Template "${formData.name.trim()}" updated successfully`, 'success');
      } else {
        // Create mode
        await api.createCaseTemplate({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          requiredDocuments: validDocuments,
          reminderIntervalDays: parseInt(formData.reminderIntervalDays) || 10,
          administrativeSilenceDays: parseInt(formData.administrativeSilenceDays) || 60,
        });
        showToast(`Template "${formData.name.trim()}" created successfully`, 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || (template ? 'Failed to update template' : 'Failed to create template');
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[98vh] overflow-y-auto shadow-2xl animate-scale-in my-2 sm:my-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{template ? 'Edit Template' : 'New Template'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-slide-down">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Student Visa, Work Permit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Interval (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.reminderIntervalDays}
                onChange={(e) => setFormData({ ...formData, reminderIntervalDays: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrative Silence (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.administrativeSilenceDays}
                onChange={(e) =>
                  setFormData({ ...formData, administrativeSilenceDays: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Required Documents</label>
              <button
                type="button"
                onClick={addDocument}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Document</span>
              </button>
            </div>

            {requiredDocuments.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                No documents added. Click "Add Document" to add required documents.
              </div>
            ) : (
              <div className="space-y-3">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Document Code
                          </label>
                          <input
                            type="text"
                            value={doc.code}
                            onChange={(e) => updateDocument(index, 'code', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., PASSPORT"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Document Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={doc.name}
                            onChange={(e) => updateDocument(index, 'name', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown' && suggestions.length > 0 && suggestions[0]?.index === index) {
                                e.preventDefault();
                                setActiveSuggestionIndex(prev => 
                                  prev === null ? 0 : Math.min(prev + 1, suggestions.length - 1)
                                );
                              } else if (e.key === 'ArrowUp' && suggestions.length > 0 && suggestions[0]?.index === index) {
                                e.preventDefault();
                                setActiveSuggestionIndex(prev => 
                                  prev === null ? suggestions.length - 1 : Math.max(prev - 1, 0)
                                );
                              } else if (e.key === 'Enter' && activeSuggestionIndex !== null && suggestions[activeSuggestionIndex] && suggestions[activeSuggestionIndex].index === index) {
                                e.preventDefault();
                                selectSuggestion(index, suggestions[activeSuggestionIndex].name);
                              } else if (e.key === 'Escape') {
                                setSuggestions([]);
                                setActiveSuggestionIndex(null);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding suggestions to allow click
                              setTimeout(() => {
                                setSuggestions([]);
                                setActiveSuggestionIndex(null);
                              }, 200);
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Valid Passport (type to see suggestions)"
                          />
                          {suggestions.length > 0 && suggestions[0]?.index === index && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {suggestions.map((suggestion, sugIndex) => (
                                <button
                                  key={sugIndex}
                                  type="button"
                                  onClick={() => selectSuggestion(index, suggestion.name)}
                                  onMouseEnter={() => setActiveSuggestionIndex(sugIndex)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                    activeSuggestionIndex === sugIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                  }`}
                                >
                                  {suggestion.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        value={doc.description || ''}
                        onChange={(e) => updateDocument(index, 'description', e.target.value)}
                        rows={5}
                        style={{ resize: 'vertical', minHeight: '100px' }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (template ? 'Updating...' : 'Creating...') : (template ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

