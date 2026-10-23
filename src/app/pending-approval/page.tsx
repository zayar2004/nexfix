"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Clock, LogOut, RefreshCw, ShieldCheck, 
  MessageCircle, CheckCircle2, Loader2 
} from "lucide-react";

export default function PendingApprovalPage() {
  const { update } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Admin Approve ဖြစ်မဖြစ် စစ်ဆေးတဲ့ Function
  const checkApprovalStatus = async () => {
    try {
      // ၁။ Server ဆီကနေ Session အသစ်ဆုံးကို အတင်းဆွဲယူမယ် (Cache မသုံးဘူး)
      const res = await fetch("/api/auth/session", { 
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      const sessionData = await res.json();

      if (sessionData?.user?.isApproved === true) {
        // Approve ဖြစ်သွားပြီဆိုရင်
        setIsApproved(true);
        
        // NextAuth ရဲ့ Session ကိုပါ အတင်း Update လုပ်မယ်
        await update();
        
        // ခဏနေပြီး Home Page ကို ပို့မယ်
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Check failed", err);
      return false;
    }
  };

  // Auto Polling (၁၀ စက္ကန့်တစ်ခါ)
  useEffect(() => {
    if (isApproved) return;

    checkApprovalStatus();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkApprovalStatus();
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
    const approved = await checkApprovalStatus();
    setChecking(false);
    if (!approved) {
      // မဖြစ်သေးရင် Page ကို Refresh လုပ်မယ် (Session အသစ် ရအောင်)
      window.location.reload();
    }
  };

  if (isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-5 relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10 mt-10">
        
        {/* Animated Icon */}
        <div className="relative flex justify-center mb-8">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[spin_3s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-[spin_4s_linear_infinite_reverse]" style={{ borderBottomColor: 'transparent', borderRightColor: 'transparent' }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            စောင့်ဆိုင်းနေပါသည်
          </h1>
          <p className="text-[13px] text-slate-400 leading-relaxed px-2">
            လုံခြုံရေးအတွက် Admin မှ စစ်ဆေးနေပါသည်။ Approve ဖြစ်သွားပါက အလိုအလျောက် ဝင်ရောက်နိုင်ပါမည်။
          </p>
        </div>

        {/* Progress Bar */}
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
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.3)]"
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

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>နောက် {countdown} စက္ကန့်အကြာတွင် စစ်ဆေးမည်</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5" />
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
