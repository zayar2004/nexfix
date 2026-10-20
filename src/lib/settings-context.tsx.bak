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

  useEffect(() => {
    const savedLocale = localStorage.getItem("nexfix_locale") as Locale | null;
    if (savedLocale) setLocaleState(savedLocale);

    const savedTheme = localStorage.getItem("nexfix_theme") as Theme | null;
    if (savedTheme) setThemeState(savedTheme);

    const savedFont = localStorage.getItem("nexfix_fontsize") as FontSize | null;
    if (savedFont) setFontSizeState(savedFont);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("nx-light");
      root.classList.remove("nx-dark");
    } else {
      root.classList.add("nx-dark");
      root.classList.remove("nx-light");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "large") {
      root.classList.add("nx-text-large");
    } else {
      root.classList.remove("nx-text-large");
    }
  }, [fontSize]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("nexfix_locale", l);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("nexfix_theme", t);
  };

  const setFontSize = (f: FontSize) => {
    setFontSizeState(f);
    localStorage.setItem("nexfix_fontsize", f);
  };

  // 🌟 Translation Function
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
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
