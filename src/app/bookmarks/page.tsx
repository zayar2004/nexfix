"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Bookmark, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";

type BookmarkItem = {
  id: string;
  articleId: string;
  slug: string;
  category: string | null;
  coverImageUrl: string | null;
  title: string;
};

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setBookmarks(data.data);
        else setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (articleId: string) => {
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      setBookmarks((prev) => prev.filter((b) => b.articleId !== articleId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto pb-6">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] flex items-center gap-2">
            <Bookmark className="text-[var(--nx-cyan)]" size={24} /> My Bookmarks
          </h1>
        </div>

        <div className="px-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[var(--nx-cyan)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error === "Unauthorized" ? "ဤစာမျက်နှာကို ကြည့်ရန် Login ဝင်ပါ။" : error}
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-10 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
              <Bookmark size={40} className="mx-auto text-[var(--nx-text-muted-updated)] opacity-30 mb-3" />
              <p className="text-[var(--nx-text-muted-updated)] text-sm mb-4">You haven't bookmarked any articles yet.</p>
              <Link href="/library" className="inline-block px-4 py-2 bg-[var(--nx-cyan)] text-black text-sm font-bold rounded-lg">
                Browse Library
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookmarks.map((b) => (
                <div key={b.id} className="flex gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
                  <Link href={`/library/${b.slug}`} className="flex-1 flex gap-3 min-w-0">
                    {b.coverImageUrl ? (
                      <img 
                        src={b.coverImageUrl.startsWith("http") ? b.coverImageUrl : `${process.env.NEXT_PUBLIC_S3_URL}/${b.coverImageUrl}`} 
                        alt={b.title} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-[var(--nx-border-updated)]" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-[var(--nx-bg-base-deep)] border border-[var(--nx-border-updated)] flex items-center justify-center">
                        <BookOpen size={24} className="text-[var(--nx-text-muted-updated)] opacity-50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {b.category && (
                        <span className="text-[10px] font-bold text-[var(--nx-cyan)] mb-1">{b.category}</span>
                      )}
                      <p className="font-bold text-[var(--nx-text-primary)] text-sm truncate">{b.title || b.slug}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleRemove(b.articleId)} 
                    className="p-2 self-center text-[var(--nx-cyan)] hover:bg-[var(--nx-cyan)]/10 rounded-lg transition"
                    title="Remove bookmark"
                  >
                    <Bookmark size={20} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
