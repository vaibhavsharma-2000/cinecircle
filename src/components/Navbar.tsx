"use client";

import { useState, useRef, useEffect } from "react";
import { Header, Button, Avatar, Badge } from "@usefragments/ui";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { MovieItem } from "@/lib/tmdb";
import { UserAvatar } from "./UserAvatar";
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  Film,
  Bookmark,
  Users,
  Sparkles,
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
  watchlistCount: number;
  friendsCount: number;
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
  watchlistCount,
  friendsCount,
  isDarkMode,
  onToggleTheme,
  onOpenInstallPwa,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "discover", label: "Discover", icon: Film },
    { id: "recommendations", label: "Recommendations", icon: Sparkles },
    { id: "watchlist", label: "Watchlist", icon: Bookmark, badge: watchlistCount },
    { id: "matcher", label: "Group Matcher", icon: Sparkles },
    { id: "friends", label: "Friends", icon: Users, badge: friendsCount },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideMobile = mobileRef.current && mobileRef.current.contains(target);
      const isInsideDesktop = desktopRef.current && desktopRef.current.contains(target);
      if (!isInsideMobile && !isInsideDesktop) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Header className="sticky top-0 z-40 bg-[var(--canvas)]/95 backdrop-blur-xl border-b border-[var(--surface-border)] px-3 sm:px-6 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full">
        
        {/* Top Header Row: Brand Logo & Mobile Right Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            onClick={() => setActiveTab("discover")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--brand-accent)] flex items-center justify-center text-[var(--brand-accent-text)] font-black text-sm shadow group-hover:scale-105 transition">
              C
            </div>
            <span className="text-lg font-black text-[var(--text-primary)] tracking-tight group-hover:opacity-80 transition">
              CineCircle
            </span>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2 relative" ref={mobileRef}>
            {userEmail ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 px-2 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="sm" />
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
              </button>
            ) : (
              <Button
                onClick={onOpenAuth}
                className="h-8 px-3.5 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-[11px]"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Floating Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-11 w-56 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                <div className="p-3 border-b border-[var(--surface-border)] flex items-center gap-3">
                  <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="md" />
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{profile.displayName}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">@{profile.username}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAccountModal();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left"
                >
                  <Settings className="w-4 h-4 text-[var(--text-secondary)]" /> Account & Settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleTheme();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-[var(--star-accent)]" /> Theme: Dark Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[var(--text-secondary)]" /> Theme: Light Mode
                    </>
                  )}
                </button>

                {onOpenInstallPwa && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenInstallPwa();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left"
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
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition text-left border-t border-[var(--surface-border)] pt-2 mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Input Container - Full width on mobile, compact on desktop */}
        <div className="w-full md:w-64 lg:w-72">
          <SearchAutocomplete onSelectMovie={onSelectMovie} />
        </div>

        {/* Navigation Tabs - Mobile Touch Scroll Segmented Control */}
        <nav className="flex items-center gap-0.5 bg-[var(--surface-card)] p-1 rounded-full border border-[var(--surface-border)] shadow-sm shrink-0 overflow-x-auto w-full md:w-auto max-w-full touch-pan-x">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                  isSelected
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-xs font-extrabold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-[var(--brand-accent-text)]" : "text-[var(--text-secondary)]"}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-black/20 text-[var(--brand-accent-text)]" : "bg-[var(--canvas)] text-[var(--text-primary)]"
                  }`}>
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls: Sleek Avatar Menu Dropdown with Integrated Theme Switch */}
        <div className="hidden md:flex items-center gap-2 relative" ref={desktopRef}>
          {userEmail ? (
            <div className="relative">
              {/* Minimal Avatar Icon Button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 px-2.5 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="sm" />
                <span className="text-xs font-bold text-[var(--text-primary)] max-w-[80px] truncate">
                  {profile.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
              </button>

              {/* Desktop Floating Dropdown Overlay */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <div className="p-3 border-b border-[var(--surface-border)] flex items-center gap-3">
                    <UserAvatar avatarId={profile.avatarId} displayName={profile.displayName} size="md" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{profile.displayName}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">@{profile.username}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{userEmail}</p>
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

                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition text-left cursor-pointer"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-4 h-4 text-[var(--star-accent)]" /> Theme: Dark Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-[var(--text-secondary)]" /> Theme: Light Mode
                      </>
                    )}
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
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition text-left border-t border-[var(--surface-border)] pt-2 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="w-9 h-9 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)] flex items-center justify-center p-0 shrink-0 transition"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-[var(--star-accent)]" /> : <Moon className="w-4 h-4" />}
              </button>

              <Button
                onClick={onOpenAuth}
                className="h-9 px-4 rounded-full bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            </div>
          )}
        </div>

      </div>
    </Header>
  );
}
