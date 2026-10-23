"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Music, Clock, Save, CheckCircle, Volume2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSettings, saveSettings, NotificationSettings, requestNotificationPermission, saveCustomSound } from "@/lib/notifications";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    customSoundUri: null,
    repeatIntervalMinutes: 0,
    soundName: null,
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = async () => {
    saveSettings(settings);
    await requestNotificationPermission();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.ogg')) {
      alert("MP3, WAV, OGG ဖိုင်တွေပဲ ထည့်ပါ");
      return;
    }

    setUploading(true);
    try {
      const uri = await saveCustomSound(file);
      if (uri) {
        setSettings({ ...settings, customSoundUri: uri, soundName: file.name });
      } else {
        alert("ဖိုင် သိမ်းလို့ မရပါ");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Notification Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Custom Sound */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold">Custom Notification Sound</h2>
              <p className="text-xs text-slate-400">သင့်ကိုယ်ပိုင် MP3 ကို ထည့်ပါ</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-400/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <Upload className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-sm">
              {uploading ? "တင်နေသည်..." : settings.soundName ? `ရွေးထား: ${settings.soundName}` : "MP3 ဖိုင် ရွေးပါ"}
            </span>
          </button>
          
          {settings.soundName && (
            <div className="mt-3 flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs">{settings.soundName}</span>
              </div>
              <button
                onClick={() => setSettings({ ...settings, customSoundUri: null, soundName: null })}
                className="text-xs text-red-400 hover:text-red-300"
              >
                ဖျက်မည်
              </button>
            </div>
          )}
        </div>

        {/* Repeat Interval */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold">Repeat Notification</h2>
              <p className="text-xs text-slate-400">မနှိပ်ရင် ဘယ်နှမိနစ်တစ်ခါ ထပ်ပို့မလဲ</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 5, 10, 15, 30, 60].map((min) => (
              <button
                key={min}
                onClick={() => setSettings({ ...settings, repeatIntervalMinutes: min })}
                className={`py-2.5 rounded-lg text-xs font-bold transition ${
                  settings.repeatIntervalMinutes === min
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                {min === 0 ? "Off" : `${min} min`}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Notification လာတဲ့အခါ User က မနှိပ်ဘူးဆိုရင် ဒီအချိန်အတိုင်း ထပ်ခါထပ်ခါ ပို့ပါမယ်။
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
        >
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "သိမ်းပြီးပါပြီ" : "သိမ်းဆည်းမည်"}
        </button>

        <div className="text-xs text-slate-500 text-center">
          <p>⚠️ အသံအသစ်နဲ့ Repeat ကို APK အသစ်မှာသာ အပြည့်အဝ အလုပ်လုပ်ပါမယ်။</p>
        </div>
      </main>
    </div>
  );
}
