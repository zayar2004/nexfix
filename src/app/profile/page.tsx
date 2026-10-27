"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { getPrivateExcelData } from "@/lib/local-db";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale, setLocale, t } = useSettings();
  const [toast, setToast] = useState<string | null>(null);
  const [excelCount, setExcelCount] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPrivateExcelData(session?.user?.id || "").then(data => {
      if (data) setExcelCount(data.length);
    });

    const savedSearches = localStorage.getItem("nexfix_recent_searches");
    if (savedSearches) {
      try { setRecentSearches(JSON.parse(savedSearches)); } catch {}
    }

    const savedPhoto = localStorage.getItem("nexfix_profile_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleLocaleChange = (newLocale: "my" | "en") => {
    setLocale(newLocale);
    showToast(newLocale === "my" ? "ဘာသာစကား ပြောင်းပြီးပါပြီ" : "Language changed!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo too large. Maximum size is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setProfilePhoto(base64);
      localStorage.setItem("nexfix_profile_photo", base64);
      showToast("✅ Photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!confirm("Remove your profile photo?")) return;
    setProfilePhoto(null);
    localStorage.removeItem("nexfix_profile_photo");
    showToast("Photo removed!");
  };

  // 🌟 Logout လုပ်တဲ့အခါ /login ကို သွားမယ်
  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
      // Session ရှင်းပြီးမှ /login ကို သွားမယ်
      window.location.href = "/login";
    } catch (err) {
      alert("Logout failed");
      setLoggingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav relative">
      
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-[var(--nx-accent)] text-black font-bold px-6 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {/* 🌟 Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
          <div className="w-full max-w-sm bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[var(--nx-error)]/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--nx-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--nx-text-primary)] text-center mb-2">{t("logout")}?</h3>
            <p className="text-sm text-[var(--nx-text-muted-updated)] text-center mb-6">{t("logoutConfirm")}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                disabled={loggingOut}
                className="flex-1 py-3 bg-[var(--nx-bg-surface-deep)] text-[var(--nx-text-primary)] font-bold rounded-xl hover:bg-[var(--nx-bg-elevated-deep)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogoutConfirm} 
                disabled={loggingOut}
                className="flex-1 py-3 bg-[var(--nx-error)] text-white font-bold rounded-xl hover:brightness-110 transition-colors disabled:opacity-50"
              >
                {loggingOut ? "..." : t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-8 flex flex-col items-center">
        
        <div className="relative mb-4">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-4xl text-black font-bold border-4 border-[var(--nx-bg-base-deep)] shadow-xl"
            style={profilePhoto ? { backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: 'linear-gradient(to bottom right, var(--nx-accent), var(--nx-primary))' }}
          >
            {!profilePhoto && (session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "N")}
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--nx-accent)] rounded-full flex items-center justify-center border-2 border-[var(--nx-bg-base-deep)] hover:brightness-110 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </button>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
        </div>

        {profilePhoto && (
          <button onClick={handleRemovePhoto} className="text-xs text-[var(--nx-error)] mb-2 hover:underline">
            Remove Photo
          </button>
        )}
        
        <h1 className="text-2xl font-bold text-[var(--nx-text-primary)]">{session?.user?.name || "User"}</h1>
        <p className="text-[var(--nx-text-muted-updated)] mb-2">{session?.user?.email || ""}</p>
        <span className="px-3 py-1 bg-[var(--nx-accent)]/10 border border-[var(--nx-accent)]/30 rounded-full text-xs text-[var(--nx-accent)] font-bold uppercase mb-8">
          {session?.user?.role || "Guest"}
        </span>

        <div className="w-full flex flex-col gap-3">
          
          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--nx-text-primary)] font-semibold text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {t("language")}
                </p>
              </div>
              <div className="flex bg-[var(--nx-bg-base-deep)] rounded-lg p-1">
                <button onClick={() => handleLocaleChange("en")} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${locale === "en" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-primary)]"}`}>EN</button>
                <button onClick={() => handleLocaleChange("my")} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${locale === "my" ? "bg-[var(--nx-accent)] text-black" : "text-[var(--nx-text-primary)]"}`}>MY</button>
              </div>
            </div>
          </div>

          <button onClick={() => router.push("/")} className="w-full p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl text-left hover:border-[var(--nx-accent)] transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--nx-success)]/10 flex items-center justify-center text-[var(--nx-success)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--nx-text-primary)]">My Excel Data</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)]">{excelCount > 0 ? `${excelCount} Machine Codes saved` : "No Excel file uploaded"}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[var(--nx-text-primary)] font-semibold text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                My Activity
              </p>
              {recentSearches.length > 0 && (
                <button onClick={() => { localStorage.removeItem("nexfix_recent_searches"); setRecentSearches([]); showToast("Search history cleared!"); }} className="text-xs text-[var(--nx-error)] font-medium hover:underline">Clear</button>
              )}
            </div>
            
            {recentSearches.length === 0 ? (
              <p className="text-xs text-[var(--nx-text-muted-updated)]">No recent activity yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentSearches.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-2.5 bg-[var(--nx-bg-base-deep)] rounded-lg border border-[var(--nx-border-updated)]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--nx-text-primary)] truncate">{item.machineName}</span>
                      <span className="text-xs font-mono text-[var(--nx-accent)] ml-2">{item.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {session?.user && (
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="w-full p-4 bg-[var(--nx-error)]/5 border border-[var(--nx-error)]/20 rounded-xl text-left text-[var(--nx-error)] hover:bg-[var(--nx-error)]/10 transition-colors flex items-center justify-between group mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--nx-error)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("logout")}</p>
                </div>
              </div>
            </button>
          )}

        </div>
      </main>
      <BottomNav />
    </div>
  );
}
