import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">Knowledge Library</h1>
        <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl text-[var(--nx-text-muted-updated)]">
          Knowledge Articles will appear here.
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
