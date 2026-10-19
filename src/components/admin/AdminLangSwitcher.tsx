"use client";

import { useAdminLang } from "@/lib/admin-lang-context";
import { Globe } from "lucide-react";

export function AdminLangSwitcher() {
  const { lang, setLang } = useAdminLang();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "my" : "en")}
      className="flex items-center gap-2 px-3 py-1.5 bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] rounded-lg text-white text-sm hover:bg-[var(--nx-border-updated)] transition"
      title="Switch Language"
    >
      <Globe size={16} />
      <span className="font-semibold">{lang === "en" ? "EN" : "မြန်မာ"}</span>
    </button>
  );
}
