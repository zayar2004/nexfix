"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Clock, LogOut, RefreshCw, ShieldAlert, 
  MessageCircle, CheckCircle2, ShieldCheck, Activity 
} from "lucide-react";

export default function PendingApprovalPage() {
  const { update } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Polling လုပ်နေတဲ့ အခြေအနေကို သိမ်းထားဖို့
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Admin က Approve လုပ်ပြီးသားလား စစ်ဆေးတဲ့ Function
  const checkApprovalStatus = async () => {
    try {
      // Session ကို Force Update လုပ်ပြီး isApproved အသစ်ကို ယူမယ်
      const newSession = await update();
      
      if (newSession?.user && (newSession.user as any).isApproved === true) {
        // Approve ဖြစ်သွားပြီဆိုရင်
        setIsApproved(true);
        
        // ခဏနေပြီး Home Page ကို ပို့မယ်
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        
        return true;
      }
      return false;
    } catch (err) {
      console.error("Check failed", err);
      return false;
    } finally {
      setLastChecked(new Date());
    }
  };

  // Auto Polling Logic (၁၀ စက္ကန့်တစ်ခါ)
  useEffect(() => {
    if (isApproved) return;

    // ပထမဆုံး စစ်ဆေးမယ်
    checkApprovalStatus();

    // Countdown စမယ်
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkApprovalStatus();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isApproved]);

  // Manual Refresh (Button နှိပ်ရင်)
  const handleManualRefresh = async () => {
    setChecking(true);
    setCountdown(10); // Countdown ကို ပြန် Reset
    await checkApprovalStatus();
    setChecking(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Success Screen (Approve ဖြစ်သွားရင်)
  if (isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-slate-900 px-4 transition-all duration-500">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-emerald-500/50">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
            အတည်ပြုပြီးပါပြီ!
          </h1>
          <p className="text-emerald-600 dark:text-emerald-500">
            Data များ ပေါ်လာရန် ခဏစောင့်ပါ...
          </p>
        </div>
      </div>
    );
  }

  // Main Pending UI
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* Background Mesh Gradient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] animate-pulse delay-1000" />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-md w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        
        {/* Animated Clock Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500/30 animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center backdrop-blur-sm">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          စောင့်ဆိုင်းနေပါသည်
        </h1>
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-6 uppercase tracking-wider">
          Pending Approval
        </p>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full w-1/2 animate-[slide_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Description Box */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 text-left border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                လုံခြုံရေးအတွက် သင့်အကောင့်ကို Admin မှ စစ်ဆေးနေပါသည်။
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Approve ဖြစ်သွားပါက Data များ အလိုအလျောက် ပေါ်လာပါမည်။
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleManualRefresh}
            disabled={checking}
            className="group relative w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {checking ? "စစ်ဆေးနေသည်..." : "ပြန်စစ်ဆေးမည်"}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            ထွက်မည် (Sign Out)
          </button>
        </div>

        {/* Footer Info (Auto-refresh & Security) */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>နောက် {countdown} စက္ကန့်အကြာတွင် အလိုအလျောက် စစ်ဆေးပါမည်</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>သင့်အချက်အလက်များကို လုံခြုံစွာ ထိန်းသိမ်းထားပါသည်</span>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <button 
        onClick={() => window.location.href = "/chat"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Admin ကို မေးမည်</span>
      </button>

    </div>
  );
}
