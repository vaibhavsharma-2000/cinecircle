"use client";

import { useState } from "react";
import { Button, IconButton, Badge } from "@usefragments/ui";
import { MOVIE_CHARACTER_AVATARS, CharacterAvatar, getAvatarById } from "@/constants/avatars";
import { X, Search, Check, Sparkles, User, Flame } from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
}

const CATEGORIES = [
  "Popular",
  "Superheroes",
  "Sci-Fi & Fantasy",
  "Cult TV Shows",
  "Anime & Animation",
  "Cinema Classics",
] as const;

export function AvatarPickerModal({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedId, setTempSelectedId] = useState(selectedAvatarId || "tony_stark");

  if (!isOpen) return null;

  const currentSelectedAvatar = getAvatarById(tempSelectedId);

  // Filter avatars by search query or category
  const filteredAvatars = MOVIE_CHARACTER_AVATARS.filter((avatar) => {
    const matchesSearch =
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.showMovie.toLowerCase().includes(searchQuery.toLowerCase());

    if (searchQuery.trim()) return matchesSearch;
    return avatar.category === activeCategory;
  });

  const handleConfirm = () => {
    onSelectAvatar(tempSelectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Character Avatar Vault</h3>
              <p className="text-xs text-[var(--text-secondary)]">Choose an iconic movie or TV persona</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search character or show (e.g. Iron Man, Wednesday, Batman)..."
              className="w-full h-10 pl-10 pr-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
            />
          </div>

          {/* Category Tabs */}
          {!searchQuery.trim() && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                        : "bg-[var(--canvas)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Avatar Grid */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-thin">
          {filteredAvatars.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
              No character avatars found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {filteredAvatars.map((avatar) => {
                const isSelected = tempSelectedId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setTempSelectedId(avatar.id)}
                    className={`group relative flex flex-col items-center p-3 rounded-2xl border transition duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--canvas)] border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)]/30 scale-105 shadow-xl"
                        : "bg-[var(--canvas)]/50 border-[var(--surface-border)] hover:border-white/40 hover:bg-[var(--canvas)]"
                    }`}
                  >
                    {/* Avatar Image Circle */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition shadow">
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          // Fallback to emoji badge if image fails to load
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="w-full h-full bg-[var(--surface-card)] flex items-center justify-center font-bold text-xl">
                        {avatar.emoji}
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center shadow">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-full mt-2 group-hover:text-[var(--brand-accent)] transition">
                      {avatar.name}
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] truncate max-w-full">
                      {avatar.showMovie}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Avatar Live Preview Header */}
        <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--brand-accent)] shadow shrink-0">
              <img
                src={currentSelectedAvatar.imageUrl}
                alt={currentSelectedAvatar.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-[var(--brand-accent)] uppercase tracking-wider block">
                Selected Avatar
              </span>
              <h4 className="font-extrabold text-xs text-[var(--text-primary)] truncate">
                {currentSelectedAvatar.name} ({currentSelectedAvatar.showMovie})
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] italic truncate">
                &quot;{currentSelectedAvatar.quote}&quot;
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-5 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition shrink-0 flex items-center gap-1.5 hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" /> Select Avatar
          </Button>
        </div>

      </div>
    </div>
  );
}
