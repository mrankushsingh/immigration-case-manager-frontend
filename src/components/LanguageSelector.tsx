import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getLanguage, setLanguage, availableLanguages, languageNames, onLanguageChange, type Language } from '../utils/i18n';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [, forceUpdate] = useState({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for language changes
    const unsubscribe = onLanguageChange(() => {
      setCurrentLang(getLanguage());
      // Force re-render by updating state
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    // Trigger a custom event to notify all components to re-render
    window.dispatchEvent(new CustomEvent('languagechange'));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-amber-100 hover:bg-amber-800/50 transition-colors"
        title="Select Language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium uppercase">{currentLang}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border overflow-hidden animate-scale-in z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          }}
        >
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                currentLang === lang
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-amber-900 font-semibold'
                  : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <span>{languageNames[lang]}</span>
              {currentLang === lang && (
                <span className="text-amber-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

