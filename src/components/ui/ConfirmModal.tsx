"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-[var(--nx-text-muted-updated)] leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 p-4 bg-[var(--nx-bg-base-deep)]/50 border-t border-[var(--nx-border-updated)]">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-[var(--nx-bg-surface-deep)] border border-[var(--nx-border-updated)] rounded-xl hover:bg-[var(--nx-border-updated)] transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition ${
              isDestructive
                ? "bg-[var(--nx-error)] text-white hover:opacity-90"
                : "bg-[var(--nx-accent)] text-black hover:opacity-90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
