import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col items-center justify-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        <h1 className="text-xl font-bold text-white mb-2">Public Chat</h1>
        <p className="text-[var(--nx-text-muted-updated)] text-sm">Real-time chat feature is coming soon in Phase 8.</p>
      </main>
      <BottomNav />
    </div>
  );
}
