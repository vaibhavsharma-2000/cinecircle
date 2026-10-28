"use client";

import { useEffect } from "react";
import { Sparkles, Users, X, Film, Check } from "lucide-react";

export interface ToastItem {
  id: string;
  type?: "rec" | "friend" | "system";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 5500);

    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex items-start gap-3.5"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center shrink-0 shadow">
            {toast.type === "rec" ? (
              <Sparkles className="w-4.5 h-4.5 fill-current" />
            ) : toast.type === "friend" ? (
              <Users className="w-4.5 h-4.5" />
            ) : (
              <Film className="w-4.5 h-4.5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1 min-w-0">
            <h4 className="text-xs font-black text-[var(--text-primary)] truncate">
              {toast.title}
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {toast.message}
            </p>

            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="pt-1 text-[11px] font-extrabold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {toast.actionLabel} →
              </button>
            )}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
