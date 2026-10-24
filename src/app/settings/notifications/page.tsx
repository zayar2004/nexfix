"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Volume2, Play, Pause, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playDefaultSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const audio = new Audio("/sounds/default-notification.mp3");
    audioRef.current = audio;
    audio.play().then(() => {
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }).catch(() => {
      alert("အသံဖိုင် မတွေ့ပါ။ APK အသစ် ပြန် Install လုပ်ပါ။");
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Notification Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Default Sound Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold">Notification Sound</h2>
              <p className="text-xs text-slate-400">App ထဲမှာ ပါပြီးသား အသံကို အသုံးပြုပါမည်</p>
            </div>
          </div>

          <button
            onClick={playDefaultSound}
            className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center gap-2 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4 text-green-400" />}
            <span className="text-sm text-green-400 font-medium">
              {isPlaying ? "ရပ်မည်" : "အသံ နားထောင်မည်"}
            </span>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-1">အချက်အလက်</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notification လာတိုင်း App ထဲမှာ ထည့်ထားတဲ့ အသံကို အလိုအလျောက် ထွက်ပါမည်။ 
                အသံ အသစ်ပြောင်းချင်ပါက App ကို Update လုပ်ပါ။
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
