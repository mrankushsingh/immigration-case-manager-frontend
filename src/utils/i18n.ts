import en from '../locales/en.json';
import es from '../locales/es.json';

export type Language = 'en' | 'es';

const translations: Record<Language, any> = {
  en,
  es,
};

let currentLanguage: Language = 'en';

// Language change listeners
const languageChangeListeners = new Set<() => void>();

// Load language from localStorage
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('app_language') as Language;
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
    currentLanguage = savedLanguage;
  }
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', lang);
    // Notify all listeners about language change
    languageChangeListeners.forEach(listener => listener());
  }
}

export function onLanguageChange(callback: () => void) {
  languageChangeListeners.add(callback);
  return () => {
    languageChangeListeners.delete(callback);
  };
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}

// Language names for display
export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
};

export const availableLanguages: Language[] = ['en', 'es'];

