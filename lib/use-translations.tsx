"use client";

import { createContext, useContext, ReactNode } from "react";
import { Language, getTranslations, TranslationKey } from "./translations";

interface TranslationsContextType {
  t: (key: TranslationKey) => string;
  language: Language;
}

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined);

export function TranslationsProvider({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  const translations = getTranslations(language);

  const t = (key: TranslationKey): string => {
    return translations[key] || key;
  };

  return (
    <TranslationsContext.Provider value={{ t, language }}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (context === undefined) {
    throw new Error("useTranslations must be used within a TranslationsProvider");
  }
  return context;
}

