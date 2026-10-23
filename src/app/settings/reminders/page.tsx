"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle, Moon, Volume2, Vibrate, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReminderSettings {
  defaultIntervalMinutes: number;
  defaultSnoozeMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  defaultIntervalMinutes: 15,
  defaultSnoozeMinutes: 5,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "06:00",
  vibrationEnabled: true,
  soundEnabled: true,
};

export default function ReminderSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexfix-reminder-settings');
    if (saved) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) }); } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('nexfix-reminder-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Reminder Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Default Interval */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold">Default Reminder Interval</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => setSettings({ ...settings, defaultIntervalMinutes: m })}
                className={`py-2 rounded-lg text-xs font-bold ${
                  settings.defaultIntervalMinutes === m ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Default Snooze */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold">Default Snooze</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => setSettings({ ...settings, defaultSnoozeMinutes: m })}
                className={`py-2 rounded-lg text-xs font-bold ${
                  settings.defaultSnoozeMinutes === m ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="font-bold">Quiet Hours</h2>
                <p className="text-xs text-slate-400">ဒီအချိန်မှာ Notification ပိတ်ထားမယ်</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, quietHoursEnabled: !settings.quietHoursEnabled })}
              className={`w-12 h-6 rounded-full transition ${settings.quietHoursEnabled ? "bg-purple-600" : "bg-gray-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.quietHoursEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          {settings.quietHoursEnabled && (
            <div className="flex gap-2 mt-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400">From</label>
                <input type="time" value={settings.quietHoursStart} onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">To</label>
                <input type="time" value={settings.quietHoursEnd} onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-green-400" />
              <span className="text-sm">Sound</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition ${settings.soundEnabled ? "bg-green-600" : "bg-gray-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">Vibration</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition ${settings.vibrationEnabled ? "bg-cyan-600" : "bg-gray-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.vibrationEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "သိမ်းပြီးပါပြီ" : "သိမ်းဆည်းမည်"}
        </button>
      </main>
    </div>
  );
}
