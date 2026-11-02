"use client";

import { useState, useEffect } from "react";
import { Card, Button, IconButton, Badge } from "@usefragments/ui";
import { Cookie, ShieldCheck, Settings, X, Check, Video } from "lucide-react";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  readConsent,
  type CookiePreferences,
} from "@/lib/consent";

export type { CookiePreferences };

interface CookieConsentModalProps {
  onPreferencesSaved?: (prefs: CookiePreferences) => void;
}

export function CookieConsentModal({ onPreferencesSaved }: CookieConsentModalProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    sessionReplay: false,
  });

  useEffect(() => {
    const openSettings = () => {
      const saved = readConsent();
      if (saved) setPreferences(saved);
      setShowModal(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);

    const saved = readConsent();
    if (saved) {
      setPreferences(saved);
      return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    }
    // Delay showing banner slightly for smooth entrance
    const timer = setTimeout(() => setShowBanner(true), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
    if (onPreferencesSaved) {
      onPreferencesSaved(prefs);
    }
  };

  const handleAcceptAll = () => {
    const allOn: CookiePreferences = { essential: true, functional: true, analytics: true, sessionReplay: true };
    saveConsent(allOn);
  };

  const handleEssentialOnly = () => {
    const essentialOnly: CookiePreferences = { essential: true, functional: false, analytics: false, sessionReplay: false };
    saveConsent(essentialOnly);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* FLOATING COOKIE CONSENT BANNER (Bottom-left/center floating card) */}
      {showBanner && !showModal && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
          <Card className="p-5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center shrink-0 shadow">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--text-primary)]">Cookie & Privacy Preferences</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Your session & privacy choices</p>
                </div>
              </div>
              <button
                onClick={handleEssentialOnly}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              We use essential local storage to <strong className="text-[var(--text-primary)]">keep you logged in across browser closes</strong>, remember your dark/light mode preference, and save your watchlist.
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Accept All</strong> also turns on session replay: a recording of the pages you see and your clicks and scrolls, sent to rrweb Cloud to help us fix bugs. Typed text is masked, and sign-in and account screens are never recorded. Change this anytime under <strong className="text-[var(--text-primary)]">Cookie settings</strong> in the footer.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                onClick={handleAcceptAll}
                className="flex-1 h-9 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition"
              >
                Accept All
              </Button>

              <Button
                onClick={() => setShowModal(true)}
                className="h-9 px-3 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" /> Customize
              </Button>

              <Button
                onClick={handleEssentialOnly}
                className="h-9 px-3 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)] font-bold text-xs rounded-xl transition"
              >
                Essential Only
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DETAILED COOKIE PREFERENCES MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">Cookie & Storage Preferences</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Manage how CineCircle uses local storage and cookies</p>
                </div>
              </div>

              <IconButton
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
              >
                <X className="w-4 h-4" />
              </IconButton>
            </div>

            {/* Cookie Categories List */}
            <div className="space-y-4">
              
              {/* Category 1: Essential Cookies */}
              <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Essential Authentication & Session Storage</h4>
                  </div>
                  <Badge className="bg-[var(--success-subtle)] border border-[var(--success-border)] text-[var(--success)] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Always Active
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Required for login persistence (<code className="text-[var(--brand-accent)]">cinecircle_auth_session</code>), security tokens, and preventing accidental logouts when you close your browser tab.
                </p>
              </div>

              {/* Category 2: Functional & Preferences */}
              <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[var(--brand-accent)]" />
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Functional & UI Preferences</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[var(--surface-card)] border border-[var(--surface-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-accent)]" />
                  </label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Saves your dark/light mode preference, chosen streaming region (<code className="text-[var(--brand-accent)]">cinecircle_streaming_country</code>: 🇩🇪 Germany, 🇮🇳 India, 🇨🇦 Canada, 🇺🇸 USA, 🇬🇧 UK, 🇦🇺 Australia), Crunchyroll character avatar persona (<code className="text-[var(--brand-accent)]">avatar_character_id</code>), and active tab state so your experience remains seamless across visits.
                </p>
              </div>

              {/* Category 3: Personalized Discovery & Analytics */}
              <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-[var(--star-accent)]" />
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Personalized TMDB Discovery & Analytics</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[var(--surface-card)] border border-[var(--surface-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-accent)]" />
                  </label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Remembers your multi-genre filter selections (Feature Films, TV Shows, Documentaries) and watchlist sorting criteria to tailor recommendations.
                </p>
              </div>

              {/* Category 4: Session Replay (opt-in, off unless chosen) */}
              <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[var(--brand-accent)]" />
                    <h4 id="session-replay-label" className="font-extrabold text-xs text-[var(--text-primary)]">Session Replay (rrweb Cloud)</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      aria-labelledby="session-replay-label"
                      checked={preferences.sessionReplay}
                      onChange={(e) => setPreferences({ ...preferences, sessionReplay: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[var(--surface-card)] border border-[var(--surface-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-accent)]" />
                  </label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Records how you use CineCircle (the pages you see, including names and recommendations from your circle, plus clicks, scrolling and navigation) and sends it to our processor <strong className="text-[var(--text-primary)]">rrweb Cloud</strong> (<code className="text-[var(--brand-accent)]">api.rrweb.com</code>) so we can reproduce bugs and improve the design. Everything you type is masked, sign-in, account, profile and password-reset screens are blocked entirely, and we don&apos;t send your IP address, browser details or account ID. It uses one tab-scoped session storage key (<code className="text-[var(--brand-accent)]">rrweb-browser-client-recording-id</code>) and no cookies.
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Turning this off stops recording immediately. Recordings already sent are kept under our retention policy; contact the CineCircle team to have them deleted.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-[var(--surface-border)]">
              <Button
                onClick={handleSaveCustom}
                className="flex-1 h-11 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Preferences
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                className="h-11 px-4 bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl border border-[var(--surface-border)] transition"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
