import { createContext, useContext, useState } from 'react';
import { load, save } from '@/lib/storage';

export const API_LANGUAGES = [
  ['pt-BR', 'Português'], ['en', 'English'], ['de', 'Deutsch'], ['es', 'Español'],
  ['fr', 'Français'], ['it', 'Italiano'], ['ko', '한국어'], ['pl', 'Polski'],
  ['ru', 'Русский'], ['tr', 'Türkçe'], ['uk', 'Українська'], ['zh', '中文'],
].map(([code, label]) => ({ code, label }));

const ApiLanguageContext = createContext(null);

export function ApiLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => { const stored = load('api_language', 'pt-BR'); return stored === 'pt' ? 'pt-BR' : stored; });
  const setLanguage = (value) => {
    setLanguageState(value);
    save('api_language', value);
  };
  return <ApiLanguageContext.Provider value={{ language, setLanguage, languages: API_LANGUAGES }}>{children}</ApiLanguageContext.Provider>;
}

export function useApiLanguage() {
  const context = useContext(ApiLanguageContext);
  if (!context) throw new Error('useApiLanguage deve ser usado dentro de ApiLanguageProvider');
  return context;
}

export const itemsCacheKey = (language) => `items_v4_${language}`;