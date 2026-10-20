"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, TranslationKey } from "./translations";

type Locale = "my" | "en";
type Theme = "dark" | "light";
type FontSize = "normal" | "large";

interface SettingsContextType {
  locale: Locale;
  theme: Theme;
  fontSize: FontSize;
  setLocale: (l: Locale) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (f: FontSize) => void;
  t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  // Load from localStorage ONCE on mount (no re-apply to DOM to prevent flash)
  useEffect(() => {
    const savedLocale = localStorage.getItem("nexfix-locale") as Locale | null;
    if (savedLocale) setLocaleState(savedLocale);

    const savedTheme = localStorage.getItem("nexfix-theme") as Theme | null;
    if (savedTheme) setThemeState(savedTheme);

    const savedFont = localStorage.getItem("nexfix-fontsize") as FontSize | null;
    if (savedFont) setFontSizeState(savedFont);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("nexfix-theme", t);
    // Apply immediately
    const root = document.documentElement;
    root.classList.remove("nx-dark", "nx-light");
    root.classList.add(t === "light" ? "nx-light" : "nx-dark");
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("nexfix-locale", l);
    document.documentElement.setAttribute("lang", l === "my" ? "my" : "en");
  };

  const setFontSize = (f: FontSize) => {
    setFontSizeState(f);
    localStorage.setItem("nexfix-fontsize", f);
    document.documentElement.setAttribute("data-font-size", f);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ locale, theme, fontSize, setLocale, setTheme, setFontSize, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
