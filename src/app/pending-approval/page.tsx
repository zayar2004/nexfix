"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Clock, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

export default function PendingApprovalPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Reload — session refresh ဖြစ်ပြီး approve ဖြစ်သွားရင် ဆက်သွားမယ်
    window.location.reload();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          စောင့်ဆိုင်းနေပါသည်
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Pending Approval
        </p>

        {/* Description */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                သင့်အကောင့်ကို Admin မှ စစ်ဆေးနေပါသည်။
                <br />
                Approve ဖြစ်သွားပါက Data များ အလိုအလျောက် ပေါ်လာပါမည်။
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "စစ်ဆေးနေသည်..." : "ပြန်စစ်ဆေးမည်"}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ထွက်မည် (Sign Out)
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
          မေးခွန်းရှိပါက Admin ကို ဆက်သွယ်ပါ။
        </p>
      </div>
    </div>
  );
}
