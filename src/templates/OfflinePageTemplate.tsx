"use client";

// ==========================================
// OFFLINE PAGE TEMPLATE
// ==========================================
// Page အသစ်တိုင်းမှာ ဒီ Template ကို Copy လုပ်ပြီး
// ကိုယ့် Data နဲ့ အစားထိုးလိုက်ရုံပါပဲ။
// ==========================================

import { useOfflineData } from "@/lib/useOfflineData";
import { getLocalData } from "@/lib/local-db";
import { WifiOff, Loader2 } from "lucide-react";

type MyData = {
  // သင့် Data Type ကို ဒီမှာ သတ်မှတ်ပါ
  id: string;
  title: string;
};

export default function MyPage() {
  const { data, loading, isOffline, error, refresh } = useOfflineData<MyData>({
    // ၁။ Local Storage ကနေ Data ယူဖို့ (အမြန်ဆုံး)
    getLocal: async () => {
      const local = await getLocalData();
      // သင့် Data ကို ဒီမှာ ပြင်ပါ
      // ဥပမာ: return local?.someData || null;
      return null;
    },

    // ၂။ Server ကနေ Data ယူဖို့ (Online ဖြစ်ရင်)
    fetchServer: async () => {
      const res = await fetch("/api/your-endpoint", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) return null;
      // သင့် Data ကို ဒီမှာ ပြန်ပါ
      return json.data;
    },

    // ၃။ Local Storage မှာ Data သိမ်းဖို့ (optional)
    saveLocal: async (data) => {
      // ဒါက လိုအပ်မှ ထည့်ပါ
    },
  });

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nx-bg-base-deep)]">
        <Loader2 className="w-8 h-8 text-[var(--nx-cyan)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)]">
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-3 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode</span>
        </div>
      )}

      <div className="p-4">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : data ? (
          <div>
            {/* သင့် UI ကို ဒီမှာ ရေးပါ */}
            <p className="text-white">{JSON.stringify(data)}</p>
          </div>
        ) : (
          <p className="text-slate-400">No data</p>
        )}
      </div>
    </div>
  );
}
