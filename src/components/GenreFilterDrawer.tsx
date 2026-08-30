"use client";

import { useState } from "react";
import { Button, IconButton, Badge } from "@usefragments/ui";
import { MOVIE_GENRES, FilterOptions } from "@/lib/tmdb";
import {
  X,
  SlidersHorizontal,
  Sparkles,
  Star,
  Calendar,
  RotateCcw,
  Check,
  Film,
  Tv,
  Video,
} from "lucide-react";

interface GenreFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export function GenreFilterDrawer({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
}: GenreFilterDrawerProps) {
  const [contentType, setContentType] = useState<"all" | "movie" | "tv" | "documentary">(
    currentFilters.contentType || "all"
  );
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(currentFilters.genreIds || []);
  const [minRating, setMinRating] = useState<number>(currentFilters.minRating || 0);
  const [decade, setDecade] = useState<string>(currentFilters.decade || "all");
  const [sortBy, setSortBy] = useState<"popularity.desc" | "vote_average.desc" | "primary_release_date.desc">(
    currentFilters.sortBy || "popularity.desc"
  );

  if (!isOpen) return null;

  const toggleGenre = (id: number) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setContentType("all");
    setSelectedGenreIds([]);
    setMinRating(0);
    setDecade("all");
    setSortBy("popularity.desc");
  };

  const handleApply = () => {
    onApplyFilters({
      contentType,
      genreIds: selectedGenreIds,
      minRating,
      decade,
      sortBy,
      page: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--surface-card)] border-l border-[var(--surface-border)] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--surface-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Discovery Studio</h3>
              <p className="text-xs text-[var(--text-secondary)]">Filter TMDB by media format and genres</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-7 pr-4 scrollbar-thin">
          
          {/* 1. Content Format Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[var(--brand-accent)]" /> 1. Format & Media Type
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "all", label: "All Media", icon: "🌟" },
                { id: "movie", label: "Movies", icon: "🎬" },
                { id: "tv", label: "TV Series", icon: "📺" },
                { id: "documentary", label: "Documentaries", icon: "📽️" },
              ].map((f) => {
                const isSelected = contentType === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setContentType(f.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border ${
                      isSelected
                        ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-sm"
                        : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/30"
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Multi-Genre Pill Cloud */}
          <div className="space-y-3 pt-4 border-t border-[var(--surface-border)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                2. Select Genres to Combine
              </label>
              {selectedGenreIds.length > 0 && (
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {selectedGenreIds.length} Selected
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Combine genres (e.g. Sci-Fi + Thriller) to discover exact cinematic crossovers.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {MOVIE_GENRES.map((g) => {
                const isSelected = selectedGenreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow scale-105"
                        : "bg-[var(--canvas)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/30"
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Minimum Rating Threshold */}
          <div className="space-y-3 pt-4 border-t border-[var(--surface-border)]">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> 3. Quality & Rating Filter
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 0, label: "Any Rating" },
                { val: 7.0, label: "★ 7.0+ (Good)" },
                { val: 7.5, label: "★ 7.5+ (Great)" },
                { val: 8.0, label: "★ 8.0+ (Masterpieces)" },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition border ${
                    minRating === r.val
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-sm font-black"
                      : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Release Era */}
          <div className="space-y-3 pt-4 border-t border-[var(--surface-border)]">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" /> 4. Release Era
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "All Time" },
                { id: "2020s", label: "2020s Modern" },
                { id: "2010s", label: "2010s" },
                { id: "2000s", label: "2000s" },
                { id: "90s", label: "90s Classics" },
              ].map((era) => (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => setDecade(era.id)}
                  className={`p-2 rounded-xl text-[11px] font-bold text-center transition border ${
                    decade === era.id
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] font-black"
                      : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sort By */}
          <div className="space-y-3 pt-4 border-t border-[var(--surface-border)]">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              5. Order Results By
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "popularity.desc", label: "Most Popular" },
                { id: "vote_average.desc", label: "Highest Rated" },
                { id: "primary_release_date.desc", label: "Latest" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as any)}
                  className={`p-2 rounded-xl text-[11px] font-bold text-center transition border ${
                    sortBy === s.id
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] font-black"
                      : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-[var(--surface-border)] bg-[var(--surface-card)] shrink-0 flex items-center gap-3">
          <Button
            type="button"
            onClick={handleReset}
            className="h-11 px-4 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 h-11 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" /> Apply Filters
          </Button>
        </div>

      </div>
    </div>
  );
}
