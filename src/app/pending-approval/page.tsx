"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Clock, LogOut, RefreshCw, ShieldCheck, 
  MessageCircle, CheckCircle2, Loader2, DownloadCloud 
} from "lucide-react";

export default function PendingApprovalPage() {
  const { update } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  // Update System အတွက် State အသစ်
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialBuildId = useRef<string | null>(null);

  // ၁။ Update ရှိမရှိ စစ်ဆေးတဲ့ Function
  const checkForUpdates = async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      const data = await res.json();
      
      if (!initialBuildId.current) {
        initialBuildId.current = data.buildId;
      } else if (initialBuildId.current !== data.buildId) {
        setUpdateAvailable(true); // Version မတူတော့ရင် Update ရှိတယ်လို့ သတ်မှတ်
      }
    } catch (err) {
      console.error("Update check failed", err);
    }
  };

  // ၂။ Admin Approve ဖြစ်မဖြစ် စစ်ဆေးတဲ့ Function
  const checkApprovalStatus = async () => {
    try {
      const newSession = await update();
      if (newSession?.user && (newSession.user as any).isApproved === true) {
        setIsApproved(true);
        setTimeout(() => { window.location.href = "/"; }, 2000);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ၃။ စနစ်တွေ အလုပ်လုပ်ဖို့ Timer ချိတ်ခြင်း
  useEffect(() => {
    if (isApproved) return;
    
    checkApprovalStatus();
    checkForUpdates();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkApprovalStatus();
          checkForUpdates(); // Countdown ပြီးတိုင်း Update ပါ စစ်မယ်
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isApproved]);

  const handleManualRefresh = async () => {
    setChecking(true);
    setCountdown(10);
    await checkApprovalStatus();
    setChecking(false);
  };

  if (isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center animate-in zoom-in duration-500">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-white mb-2">အတည်ပြုပြီးပါပြီ</h1>
          <p className="text-slate-400">Data များ ပေါ်လာရန် ခဏစောင့်ပါ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-5 relative overflow-hidden">
      
      {/* Update Banner လေး အပေါ်ဆုံးမှာ ပေါ်လာမယ် */}
      {updateAvailable && (
        <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-sm py-3 px-4 flex justify-center items-center gap-2 z-50 animate-in slide-in-from-top duration-300">
          <DownloadCloud className="w-4 h-4" />
          <span>စနစ် Update အသစ် ရနိုင်ပါပြီ။</span>
          <button 
            onClick={() => window.location.reload()}
            className="ml-2 bg-white text-blue-600 px-3 py-1 rounded-full font-bold text-xs hover:bg-blue-50 transition-colors"
          >
            Refresh လုပ်မည်
          </button>
        </div>
      )}

      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10 mt-10">
        {/* Top Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 rounded-3xl border border-blue-500/30 animate-ping opacity-20" />
            <Clock className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            စောင့်ဆိုင်းနေပါသည်
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed px-4">
            လုံခြုံရေးအတွက် Admin မှ စစ်ဆေးနေပါသည်။ Approve ဖြစ်သွားပါက အလိုအလျောက် ဝင်ရောက်နိုင်ပါမည်။
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleManualRefresh}
            disabled={checking}
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-xl transition-all active:scale-[0.98]"
          >
            {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {checking ? "စစ်ဆေးနေသည်..." : "အခြေအနေ ပြန်စစ်မည်"}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl transition-all active:scale-[0.98] border border-white/5"
          >
            <LogOut className="w-4 h-4" />
            ထွက်မည်
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>နောက် {countdown} စက္ကန့်အကြာတွင် အလိုအလျောက် စစ်ဆေးပါမည်</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>စကားဝှက်နှင့် အချက်အလက်များ လုံခြုံစွာ ထိန်းသိမ်းထားသည်</span>
          </div>
        </div>
      </div>

      {/* Support Button */}
      <div className="absolute bottom-6 w-full px-5">
        <button 
          onClick={() => router.push("/chat")}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl border border-white/10 backdrop-blur-md transition-all text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4 text-blue-400" />
          Admin ကို ဆက်သွယ်ရန်
        </button>
      </div>
    </div>
  );
}
