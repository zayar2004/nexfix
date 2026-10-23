"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Clock, LogOut, RefreshCw, ShieldCheck, 
  MessageCircle, CheckCircle2, Loader2, DownloadCloud, Sparkles 
} from "lucide-react";

export default function PendingApprovalPage() {
  const { update } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialBuildId = useRef<string | null>(null);

  const checkForUpdates = async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      const data = await res.json();
      if (!initialBuildId.current) {
        initialBuildId.current = data.buildId;
      } else if (initialBuildId.current !== data.buildId) {
        setUpdateAvailable(true);
      }
    } catch (err) {
      console.error("Update check failed", err);
    }
  };

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

  useEffect(() => {
    if (isApproved) return;
    checkApprovalStatus();
    checkForUpdates();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkApprovalStatus();
          checkForUpdates();
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
      <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
        {/* Success Glow */}
        <div className="absolute w-[300px] h-[300px] bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
        <div className="relative text-center animate-in zoom-in duration-500 z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">အတည်ပြုပြီးပါပြီ</h1>
          <p className="text-emerald-400/80">Data များ ပေါ်လာရန် ခဏစောင့်ပါ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden font-sans">
      
      {/* 🌟 Cyberpunk Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20" />
      </div>

      {/* ⚠️ Update Notification Banner */}
      {updateAvailable && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 px-4 rounded-full flex justify-center items-center gap-2 z-50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4" />
          <span>Update အသစ် ရနိုင်ပါပြီ</span>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-semibold text-xs transition-colors backdrop-blur-sm"
          >
            Refresh
          </button>
        </div>
      )}

      {/* 💎 Main Glass Card */}
      <div className="w-full max-w-sm relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-blue-500/10">
        
        {/* Animated Icon */}
        <div className="relative flex justify-center mb-8 mt-2">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Outer Glowing Ring */}
            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[spin_3s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-[spin_4s_linear_infinite_reverse]" style={{ borderBottomColor: 'transparent', borderRightColor: 'transparent' }} />
            
            {/* Center Icon */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            စောင့်ဆိုင်းနေပါသည်
          </h1>
          <p className="text-[13px] text-slate-400 leading-relaxed px-2">
            လုံခြုံရေးအတွက် Admin မှ စစ်ဆေးနေပါသည်။ Approve ဖြစ်သွားပါက အလိုအလျောက် ဝင်ရောက်နိုင်ပါမည်။
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleManualRefresh}
            disabled={checking}
            className="group relative w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-xl transition-all active:scale-[0.98] overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
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
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>နောက် {countdown} စက္ကန့်အကြာတွင် စစ်ဆေးမည်</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>အချက်အလက်များ လုံခြုံစွာ ထိန်းသိမ်းထားသည်</span>
          </div>
        </div>
      </div>

      {/* Support Button */}
      <div className="absolute bottom-6 w-full px-5 max-w-sm z-10">
        <button 
          onClick={() => router.push("/chat")}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-3.5 rounded-xl border border-white/10 backdrop-blur-md transition-all text-sm font-medium active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4 text-purple-400" />
          Admin ကို ဆက်သွယ်ရန်
        </button>
      </div>

    </div>
  );
}
