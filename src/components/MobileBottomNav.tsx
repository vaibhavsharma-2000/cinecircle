"use client";

import { Film, Sparkles, Bookmark, Dices, Users } from "lucide-react";
import { Badge } from "@usefragments/ui";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  watchlistCount: number;
  friendsCount: number;
  incomingRequestsCount: number;
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  watchlistCount,
  friendsCount,
  incomingRequestsCount,
}: MobileBottomNavProps) {
  const tabs = [
    { id: "discover", label: "Discover", icon: Film },
    { id: "recommendations", label: "Feeds", icon: Sparkles },
    {
      id: "watchlist",
      label: "Library",
      icon: Bookmark,
      badge: watchlistCount > 0 ? String(watchlistCount) : undefined,
    },
    { id: "matcher", label: "Matcher", icon: Dices },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      badge:
        incomingRequestsCount > 0
          ? `! ${incomingRequestsCount}`
          : friendsCount > 0
          ? String(friendsCount)
          : undefined,
      isAlert: incomingRequestsCount > 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--canvas)]/95 backdrop-blur-xl border-t border-[var(--surface-border)] px-3 py-2 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition relative cursor-pointer ${
              isSelected
                ? "text-[var(--brand-accent)] font-extrabold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isSelected ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              {Boolean(tab.badge) && (
                <span
                  className={`absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-black ${
                    tab.isAlert
                      ? "bg-[var(--secondary)] text-[var(--secondary-text)] animate-pulse shadow"
                      : "bg-[var(--brand-accent)] text-[var(--brand-accent-text)]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
