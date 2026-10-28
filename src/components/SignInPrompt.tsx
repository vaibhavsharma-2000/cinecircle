"use client";

import { Bookmark, Dices, Users, LogIn, UserPlus } from "lucide-react";
import type { AuthMode } from "./AuthModal";

export type GatedTab = "watchlist" | "matcher" | "friends";

const COPY: Record<GatedTab, { icon: typeof Bookmark; title: string; body: string }> = {
  watchlist: {
    icon: Bookmark,
    title: "Library",
    body: "Keep track of what you want to watch, what you're watching, and how you rated it.",
  },
  matcher: {
    icon: Dices,
    title: "Group Matcher",
    body: "Pick friends for movie night and see the titles everyone already wants to watch.",
  },
  friends: {
    icon: Users,
    title: "Friends",
    body: "Build a private circle, see what friends recommend, and browse their libraries.",
  },
};

export function SignInPrompt({ tab, onOpenAuth }: { tab: GatedTab; onOpenAuth: (mode: AuthMode) => void }) {
  const { icon: Icon, title, body } = COPY[tab];
  return (
    <section
      aria-labelledby="sign-in-prompt-title"
      className="max-w-md mx-auto py-14 px-6 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-5"
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-[var(--text-primary)]" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 id="sign-in-prompt-title" className="text-xl font-black text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          type="button"
          onClick={() => onOpenAuth("SIGN_UP")}
          className="h-12 px-5 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" /> Create Account
        </button>
        <button
          type="button"
          onClick={() => onOpenAuth("SIGN_IN")}
          className="h-12 px-5 rounded-xl bg-[var(--canvas)] text-[var(--text-primary)] border border-[var(--surface-border)] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--surface-hover)] transition"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" /> Sign In
        </button>
      </div>
    </section>
  );
}
