import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  Language,
  getDeviceLanguage,
  isLanguage,
  setCurrentLanguage,
} from './i18n';

const STORAGE_KEY = 'app.language';

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();
const storage: StorageLike = {
  getItem: async (key: string) => memoryStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isReady: boolean;
  needsSelection: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(getDeviceLanguage());
  const [isReady, setIsReady] = useState(false);
  const [needsSelection, setNeedsSelection] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        if (stored && isLanguage(stored)) {
          setLanguageState(stored);
          setCurrentLanguage(stored);
          setNeedsSelection(false);
        } else {
          const deviceLanguage = getDeviceLanguage();
          setLanguageState(deviceLanguage);
          setCurrentLanguage(deviceLanguage);
          setNeedsSelection(true);
        }
      } catch {
        const deviceLanguage = getDeviceLanguage();
        setLanguageState(deviceLanguage);
        setCurrentLanguage(deviceLanguage);
        setNeedsSelection(true);
      } finally {
        setIsReady(true);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    setCurrentLanguage(nextLanguage);
    await storage.setItem(STORAGE_KEY, nextLanguage);
    setNeedsSelection(false);
  };

  return (
    <LanguageContext.Provider
      value={{language, setLanguage, isReady, needsSelection}}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
