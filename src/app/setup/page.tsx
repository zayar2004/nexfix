"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSettings } from "@/lib/settings-context";
import { mergeLocalData, getLocalData } from "@/lib/local-db";
import { Download, CheckCircle2, Loader2, AlertTriangle, WifiOff, RefreshCw } from "lucide-react";

type DownloadStatus = "checking" | "downloading" | "complete" | "error" | "offline";

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { locale } = useSettings();
  const isMyanmar = locale === "my";

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("checking");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dataCount, setDataCount] = useState({
    machines: 0,
    errorCodes: 0,
    articles: 0,
    media: 0,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      startDownload();
    }
  }, [status]);

  const startDownload = async () => {
    setDownloadStatus("checking");
    setProgress(0);
    setErrorMsg(null);

    // 1. Check if already synced recently
    try {
      const localData = await getLocalData();
      if (localData && localData.lastSyncedAt) {
        const hoursSinceSync = (Date.now() - localData.lastSyncedAt) / (1000 * 60 * 60);
        // 24 နာရီအတွင်း Sync လုပ်ထားရင် — ကျော်မယ်
        if (hoursSinceSync < 24) {
          setProgress(100);
          setDataCount({
            machines: (localData.machines || []).length,
            errorCodes: (localData.errorCodes || []).length,
            articles: (localData.articles || []).length,
            media: (localData.media || []).length,
          });
          setDownloadStatus("complete");
          setTimeout(() => router.push("/"), 1500);
          return;
        }
      }
    } catch (err) {
      console.warn("Check local data failed:", err);
    }

    // 2. Check online
    if (!navigator.onLine) {
      setDownloadStatus("offline");
      setErrorMsg(
        isMyanmar
          ? "Internet မရှိပါ။ Internet ရှိရှိ ပြန်စမ်းပါ။"
          : "No internet. Please retry with internet."
      );
      return;
    }

    // 3. Start download
    setDownloadStatus("downloading");
    setProgress(10);

    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setProgress(50);

      if (!data.ok) {
        throw new Error(data.error || "Sync failed");
      }

      if (data.data?.pendingApproval) {
        router.push("/pending-approval");
        return;
      }

      setDataCount({
        machines: (data.data.machines || []).length,
        errorCodes: (data.data.errorCodes || []).length,
        articles: (data.data.articles || []).length,
        media: (data.data.media || []).length,
      });

      setProgress(75);
      await mergeLocalData(data.data);
      setProgress(100);
      setDownloadStatus("complete");

      // 4. Redirect to home
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadStatus("error");
      setErrorMsg(
        isMyanmar
          ? "Data Download မအောင်မြင်ပါ။ ပြန်စမ်းပါ။"
          : "Download failed. Please retry."
      );
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />

      <div className="w-full max-w-sm relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            {downloadStatus === "complete" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : downloadStatus === "error" ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : downloadStatus === "offline" ? (
              <WifiOff className="w-8 h-8 text-amber-400" />
            ) : (
              <Download className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {downloadStatus === "complete"
              ? isMyanmar
                ? "အောင်မြင်ပါပြီ"
                : "Complete"
              : isMyanmar
              ? "Data Download"
              : "Data Download"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {downloadStatus === "checking"
              ? isMyanmar
                ? "စစ်ဆေးနေပါတယ်..."
                : "Checking..."
              : downloadStatus === "downloading"
              ? isMyanmar
                ? "Data ရယူနေပါတယ်..."
                : "Downloading..."
              : downloadStatus === "complete"
              ? isMyanmar
                ? "Offline အသုံးပြုရန် အသင့်ဖြစ်ပါပြီ"
                : "Ready for offline use"
              : downloadStatus === "offline"
              ? isMyanmar
                ? "Internet မရှိပါ"
                : "No Internet"
              : isMyanmar
              ? "Error ဖြစ်သွားပါတယ်"
              : "Error occurred"}
          </p>
        </div>

        {/* Progress Bar */}
        {(downloadStatus === "checking" || downloadStatus === "downloading") && (
          <div className="space-y-2 mb-4">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-blue-400 font-medium">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Data Count */}
        {downloadStatus === "complete" && (
          <div className="space-y-2 mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{isMyanmar ? "Machines" : "Machines"}</span>
              <span className="text-white font-medium">{dataCount.machines}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{isMyanmar ? "Error Codes" : "Error Codes"}</span>
              <span className="text-white font-medium">{dataCount.errorCodes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{isMyanmar ? "Articles" : "Articles"}</span>
              <span className="text-white font-medium">{dataCount.articles}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{isMyanmar ? "Media" : "Media"}</span>
              <span className="text-white font-medium">{dataCount.media}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 text-center">{errorMsg}</p>
          </div>
        )}

        {/* Retry Button */}
        {(downloadStatus === "error" || downloadStatus === "offline") && (
          <button
            onClick={startDownload}
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            {isMyanmar ? "ပြန်စမ်းမည်" : "Retry"}
          </button>
        )}

        {/* Complete — Redirecting */}
        {downloadStatus === "complete" && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            {isMyanmar ? "Home Page ကို ပို့နေပါတယ်..." : "Redirecting to Home..."}
          </div>
        )}
      </div>
    </div>
  );
}
