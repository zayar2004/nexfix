import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MorePage() {
  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">More Options</h1>
        <div className="flex flex-col gap-3">
          <button className="w-full py-3 px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left text-white hover:border-[var(--nx-accent)] transition-colors">
            Settings
          </button>
          <button className="w-full py-3 px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left text-white hover:border-[var(--nx-accent)] transition-colors">
            Help & Support
          </button>
          <button className="w-full py-3 px-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left text-white hover:border-[var(--nx-accent)] transition-colors">
            About NEXFIX
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
