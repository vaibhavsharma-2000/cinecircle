"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Header, Button, Badge } from "@usefragments/ui";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { MovieItem } from "@/lib/tmdb";
import { UserAvatar } from "./UserAvatar";
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Smartphone,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAccountModal: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectMovie: (movie: MovieItem) => void;
  profile: { displayName: string; username: string; avatarId: string };
  userEmail: string | null;
  authReady: boolean;
  watchlistCount: number;
  friendsCount: number;
  incomingRequestsCount?: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenInstallPwa?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAccountModal,
  onOpenAuth,
  onLogout,
  onSelectMovie,
  profile,
  userEmail,
  authReady,
  watchlistCount,
  friendsCount,
  incomingRequestsCount = 0,
  isDarkMode,
  onToggleTheme,
  onOpenInstallPwa,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "discover", label: "Discover" },
    { id: "recommendations", label: "Feeds" },
    { id: "watchlist", label: "Library", badge: watchlistCount > 0 ? String(watchlistCount) : undefined },
    { id: "matcher", label: "Matcher" },
    {
      id: "friends",
      label: "Friends",
      badge: incomingRequestsCount > 0 ? `! ${incomingRequestsCount}` : friendsCount > 0 ? String(friendsCount) : undefined,
      isAlert: incomingRequestsCount > 0,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)] px-3 sm:px-6 lg:px-8 py-3 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full gap-3 sm:gap-4">
        
        {/* Left Side: Brand Logo & Primary Navigation Links (Netflix Style) */}
        <div className="flex items-center gap-5 lg:gap-7 min-w-0">
          {/* Logo & Brand Wordmark */}
          <div
            onClick={() => setActiveTab("discover")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)] shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="CineCircle Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black text-[var(--text)] tracking-tight group-hover:opacity-85 transition">
              CineCircle
            </span>
          </div>

          {/* Primary Navigation Destinations (Text-first, Editorial, Netflix style) */}
          <nav className="hidden md:flex items-center gap-1 min-w-0">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative h-9 px-3 text-xs tracking-wider uppercase font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer rounded-md ${
                    isSelected
                      ? "text-[var(--text)] font-black bg-[var(--surface-sunken)]/60 shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-sunken)]/30"
                  }`}
                >
                  <span className="whitespace-nowrap shrink-0">{tab.label}</span>
                  {Boolean(tab.badge) && (
                    <Badge
                      className={`px-1.5 py-0.2 rounded-full text-[11px] font-black shrink-0 ${
                        tab.isAlert
                          ? "bg-[var(--danger)] text-white font-black animate-pulse"
                          : isSelected
                          ? "bg-[var(--accent)] text-[var(--primary)] font-extrabold"
                          : "bg-[var(--surface-sunken)] text-[var(--text-muted)]"
                      }`}
                    >
                      {tab.badge}
                    </Badge>
                  )}

                  {/* Prominent Active Tab Underline Indicator */}
                  {isSelected && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[var(--primary)] rounded-full transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Utilities Cluster (Expandable Search + Quick Theme Switch + Avatar/Sign In) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0" ref={dropdownContainerRef}>
          {/* Netflix-Style Expandable Search */}
          <SearchAutocomplete onSelectMovie={onSelectMovie} expandable />

          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)] flex items-center justify-center p-0 shrink-0 transition cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[var(--star-accent)]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown Menu or Sign In Button */}
          {!authReady ? (
            <div className="h-11 w-11 sm:h-9 sm:w-24 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] animate-pulse" aria-hidden="true" />
          ) : userEmail ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="h-11 sm:h-9 px-2 sm:px-2.5 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition flex items-center gap-1.5 shadow-xs cursor-pointer group"
              >
                <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="sm" />
                <span className="text-xs font-bold text-[var(--text-primary)] hidden sm:inline max-w-[85px] truncate">
                  {profile.displayName || "Profile"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition shrink-0" />
              </button>

              {/* Floating Dropdown Overlay */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <div className="p-3 border-b border-[var(--surface-border)] flex items-center gap-3">
                    <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="md" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{profile.displayName}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">@{profile.username}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{userEmail}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAccountModal();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[var(--text-secondary)]" /> Account & Settings
                  </button>

                  {onOpenInstallPwa && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenInstallPwa();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-[var(--text-secondary)]" /> Install App
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--danger)] hover:bg-[var(--danger-subtle)] flex items-center gap-2 transition text-left border-t border-[var(--surface-border)] pt-2 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={onOpenAuth}
              className="h-11 sm:h-9 px-4 rounded-full bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs shadow-sm inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap shrink-0 flex-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap shrink-0">Sign In</span>
            </Button>
          )}
        </div>

      </div>
    </Header>
  );
}
