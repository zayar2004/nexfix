"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Music, Clock, Save, CheckCircle, Volume2, Loader2, Play, Pause } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSettings, saveSettings, NotificationSettings, requestNotificationPermission, saveCustomSound } from "@/lib/notifications";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    customSoundUri: null,
    repeatIntervalMinutes: 0,
    soundName: null,
    channelId: null,
    useDefaultSound: true,
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingType, setPlayingType] = useState<"default" | "custom" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    
    const validExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExts.includes(ext)) {
      alert("MP3, WAV, OGG, M4A ဖိုင်တွေပဲ ထည့်ပါ");
      return;
    }

    setUploading(true);
    try {
      const result = await saveCustomSound(file);
      if (result) {
        setSettings({ 
          ...settings, 
          customSoundUri: result.uri, 
          soundName: file.name,
          channelId: result.channelId,
          useDefaultSound: false,
        });
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

  const playSound = (type: "default" | "custom") => {
    // လက်ရှိ ဖွင့်နေတဲ့ အသံကို ရပ်မယ်
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (isPlaying && playingType === type) {
      setIsPlaying(false);
      setPlayingType(null);
      return;
    }

    let audioUrl = "";
    if (type === "default") {
      audioUrl = "/sounds/default-notification.mp3";
    } else if (type === "custom" && settings.customSoundUri) {
      audioUrl = settings.customSoundUri;
    } else {
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play().then(() => {
      setIsPlaying(true);
      setPlayingType(type);
      audio.onended = () => {
        setIsPlaying(false);
        setPlayingType(null);
      };
    }).catch(err => {
      alert("အသံ ဖွင့်လို့မရပါ: " + err.message);
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
        
        {/* Default Sound */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold">Default Sound</h2>
              <p className="text-xs text-slate-400">App ထဲမှာ ပါပြီးသား အသံ</p>
            </div>
            <button
              onClick={() => playSound("default")}
              className="p-2.5 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-400 transition"
            >
              {isPlaying && playingType === "default" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {settings.useDefaultSound ? "✅ လက်ရှိ Default အသံကို သုံးနေသည်" : "❌ Default အသံကို မသုံးပါ"}
          </p>
        </div>

        {/* Use Default Toggle */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm">Use Default Sound</h2>
              <p className="text-xs text-slate-400 mt-0.5">ပိတ်ထားရင် ကိုယ်ပိုင်အသံ ထည့်နိုင်မည်</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, useDefaultSound: !settings.useDefaultSound })}
              className={`w-12 h-6 rounded-full transition ${settings.useDefaultSound ? "bg-green-600" : "bg-gray-600"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.useDefaultSound ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Custom Sound */}
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${settings.useDefaultSound ? 'opacity-50' : ''}`}>
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
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => settings.useDefaultSound ? alert("Default အသံကို ပိတ်မှ Custom အသံ ထည့်လို့ရပါမည်") : fileInputRef.current?.click()}
            disabled={uploading || settings.useDefaultSound}
            className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-400/50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs truncate">{settings.soundName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playSound("custom")}
                  className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-full text-purple-400"
                >
                  {isPlaying && playingType === "custom" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    setIsPlaying(false);
                    setPlayingType(null);
                    setSettings({ ...settings, customSoundUri: null, soundName: null });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  ဖျက်မည်
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
        >
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "သိမ်းပြီးပါပြီ" : "သိမ်းဆည်းမည်"}
        </button>
      </main>
    </div>
  );
}
