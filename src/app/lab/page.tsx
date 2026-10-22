"use client";

import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { FlaskConical, Box, Search, Trophy, ChevronRight, Wrench } from "lucide-react";

export default function LabPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="text-[var(--nx-cyan)]" size={28} />
            {t("labTitle")}
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">{t("labSubtitle")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/lab/viewer" className="flex items-center gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group">
            <div className="w-12 h-12 rounded-xl bg-[var(--nx-cyan)]/10 flex items-center justify-center">
              <Box size={24} className="text-[var(--nx-cyan)]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">3D Machine Viewer</p>
              <p className="text-xs text-[var(--nx-text-muted-updated)]">Explore the machine in 3D</p>
            </div>
            <ChevronRight size={18} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)]" />
          </Link>

          <Link href="/lab/fault-detective" className="flex items-center gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group">
            <div className="w-12 h-12 rounded-xl bg-[var(--nx-error)]/10 flex items-center justify-center">
              <Search size={24} className="text-[var(--nx-error)]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{t("faultDetective")}</p>
              <p className="text-xs text-[var(--nx-text-muted-updated)]">Practice troubleshooting</p>
            </div>
            <ChevronRight size={18} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)]" />
          </Link>

          <Link href="/lab/journey" className="flex items-center gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group">
            <div className="w-12 h-12 rounded-xl bg-[var(--nx-warning)]/10 flex items-center justify-center">
              <Trophy size={24} className="text-[var(--nx-warning)]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{t("technicianJourney")}</p>
              <p className="text-xs text-[var(--nx-text-muted-updated)]">View your progress</p>
            </div>
            <ChevronRight size={18} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)]" />
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
