"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "it" | "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "as-site-locale";

const LocaleContext = createContext<LocaleContextValue>({
  locale: "it",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("it");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "it" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
