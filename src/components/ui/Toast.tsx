"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-[var(--nx-success)]/10 border-[var(--nx-success)] text-[var(--nx-success)]",
    error: "bg-[var(--nx-error)]/10 border-[var(--nx-error)] text-[var(--nx-error)]",
    info: "bg-[var(--nx-accent)]/10 border-[var(--nx-accent)] text-[var(--nx-accent)]",
  };

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${styles[type]}`}>
        <span className="text-lg">{icons[type]}</span>
        <p className="flex-1 text-sm font-semibold text-white">{message}</p>
        <button onClick={onClose} className="text-white/50 hover:text-white transition">✕</button>
      </div>
    </div>
  );
}
