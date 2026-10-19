"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminTranslations, AdminLang, AdminTranslationKey } from "./admin-translations";

interface AdminLangContextType {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  t: (key: AdminTranslationKey) => string;
}

const AdminLangContext = createContext<AdminLangContextType | undefined>(undefined);

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang") as AdminLang;
    if (saved === "my" || saved === "en") {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: AdminLang) => {
    setLangState(newLang);
    localStorage.setItem("admin-lang", newLang);
  };

  const t = (key: AdminTranslationKey): string => {
    return adminTranslations[lang][key] || adminTranslations.en[key] || key;
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  const context = useContext(AdminLangContext);
  if (!context) throw new Error("useAdminLang must be used within AdminLangProvider");
  return context;
}
