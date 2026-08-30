"use client";

import { useState, useEffect } from "react";
import { Button, IconButton } from "@usefragments/ui";
import { X, Smartphone, Share2, PlusSquare, Sparkles, Download } from "lucide-react";

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallPwaModal({ isOpen, onClose }: InstallPwaModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] flex items-center justify-center text-[var(--brand-accent-text)] font-black shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Install CineCircle</h3>
              <p className="text-xs text-[var(--text-secondary)]">Experience like a native mobile app</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Benefits Preview */}
        <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--star-accent)] shrink-0" />
            <span>Full-screen experience with zero browser bars</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--star-accent)] shrink-0" />
            <span>Instant 1-tap access right from your home screen</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--star-accent)] shrink-0" />
            <span>Faster loading and persistent circle sessions</span>
          </div>
        </div>

        {/* Dynamic Platform Instructions */}
        {deferredPrompt ? (
          /* Android 1-Click Native Install */
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)] text-center">
              Your device supports 1-tap instant installation:
            </p>
            <Button
              onClick={handleNativeInstall}
              className="w-full h-12 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Download className="w-4 h-4" /> Install to Home Screen
            </Button>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guided Steps */
          <div className="space-y-4">
            <p className="text-xs font-bold text-[var(--text-primary)] text-center">
              How to install on iPhone & iPad:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[var(--canvas)] rounded-xl border border-[var(--surface-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center shrink-0 text-xs font-black text-[var(--text-primary)]">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                    Tap the Share button <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Located in Safari's bottom navigation toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[var(--canvas)] rounded-xl border border-[var(--surface-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center shrink-0 text-xs font-black text-[var(--text-primary)]">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                    Tap &quot;Add to Home Screen&quot; <PlusSquare className="w-3.5 h-3.5 text-green-400 inline" />
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Scroll down in the share sheet and tap &quot;Add to Home Screen&quot;.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs"
            >
              Got it!
            </Button>
          </div>
        ) : (
          /* General Desktop / Chrome fallback */
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)] text-center">
              To install CineCircle, open this website in Chrome or Safari on your phone and tap <strong>&quot;Add to Home Screen&quot;</strong> in your browser menu.
            </p>
            <Button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs"
            >
              Done
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
