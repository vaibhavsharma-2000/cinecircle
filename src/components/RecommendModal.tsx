"use client";

import { useState, useEffect } from "react";
import { Button, IconButton } from "@usefragments/ui";
import { MovieItem, getTMDBImageUrl } from "@/lib/tmdb";
import { FriendItem } from "@/lib/supabase";
import { X, Star, Sparkles, Send, Users, Globe, User } from "lucide-react";

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieItem | null;
  friends: FriendItem[];
  currentUserDisplayName?: string;
  isGuest?: boolean;
  onRecommend: (recommendation: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    mediaType: "movie" | "tv";
    releaseYear?: string;
    ratingStars: number;
    note: string;
    tags: string[];
    recipient: string;
    guestName?: string;
  }) => void;
}

export function RecommendModal({
  isOpen,
  onClose,
  movie,
  friends,
  currentUserDisplayName = "Guest",
  isGuest = false,
  onRecommend,
}: RecommendModalProps) {
  const [ratingStars, setRatingStars] = useState(5.0);
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState(isGuest ? "Global" : "All Friends");
  const [guestName, setGuestName] = useState(isGuest && currentUserDisplayName !== "Guest" ? currentUserDisplayName : "");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Mindbender"]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Mindbender",
    "MustWatchTogether",
    "CinematicMasterpiece",
    "ComfortWatch",
    "Hilarious",
    "DarkAndTwisted",
    "FridayNightVibe",
  ]);

  // Cleanly reset all fields when modal opens or switches movie
  useEffect(() => {
    if (isOpen) {
      setNote("");
      setRatingStars(5.0);
      setRecipient(isGuest ? "Global" : "All Friends");
      setSelectedTags(["Mindbender"]);
      setFriendSearchQuery("");
      setCustomTagInput("");
      if (isGuest && currentUserDisplayName !== "Guest") {
        setGuestName(currentUserDisplayName);
      }
    }
  }, [isOpen, movie?.id, isGuest, currentUserDisplayName]);

  if (!isOpen || !movie) return null;

  const title = movie.title || movie.name || "Movie";
  const mediaType: "movie" | "tv" = movie.media_type || (movie.first_air_date ? "tv" : "movie");
  const releaseYear = (movie.release_date || movie.first_air_date || "").substring(0, 4) || "2024";

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/[^a-zA-Z0-9]/g, "");
    if (trimmed && !availableTags.includes(trimmed)) {
      setAvailableTags([trimmed, ...availableTags]);
      setSelectedTags([...selectedTags, trimmed]);
    }
    setCustomTagInput("");
  };

  const filteredFriends = friends.filter((f) =>
    f.display_name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onRecommend({
      tmdbId: movie.id,
      title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path || null,
      mediaType,
      releaseYear,
      ratingStars,
      note: note.trim() || "Recommended by your friend!",
      tags: selectedTags,
      recipient,
      guestName: isGuest ? guestName.trim() || "A Cinephile" : undefined,
    });

    setNote("");
    setRatingStars(5.0);
    setRecipient(isGuest ? "Global" : "All Friends");
    setFriendSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-accent)] flex items-center justify-center text-[var(--brand-accent-text)] font-black text-xs shadow">
              <Sparkles className="w-4.5 h-4.5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Recommend {mediaType === "tv" ? "TV Series" : "Movie"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Share your star rating and review note</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Target Movie Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl">
          <img
            src={getTMDBImageUrl(movie.poster_path, "w500")}
            alt={title}
            className="w-12 h-16 object-cover rounded-xl border border-[var(--surface-border)]"
          />
          <div>
            <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{title}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {releaseYear} • {mediaType === "tv" ? "TV Show" : "Movie"} • TMDB ★ {movie.vote_average.toFixed(1)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Guest Name input if user is not logged in */}
          {isGuest && (
            <div className="p-3 bg-[var(--canvas)] border border-amber-500/30 rounded-2xl space-y-1.5">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Post as Guest to Global Feed
              </label>
              <input
                type="text"
                placeholder="Enter your name or nickname..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full h-10 px-3.5 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                No account needed! Your recommendation will be shared with the entire CineCircle community.
              </p>
            </div>
          )}

          {/* Recipient Picker: Global vs All Friends vs Specific Friend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--brand-accent)]" /> Audience & Visibility
              </label>
              <span className="text-[11px] font-extrabold text-[var(--brand-accent)]">
                {recipient === "Global" ? "🌍 Public Community" : recipient === "All Friends" ? "🔒 Private Circle" : `🎯 Direct: ${recipient}`}
              </span>
            </div>

            {/* Audience Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRecipient("Global")}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                  recipient === "Global"
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow"
                    : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> 🌍 Global Community
              </button>

              {!isGuest && (
                <button
                  type="button"
                  onClick={() => setRecipient("All Friends")}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                    recipient === "All Friends"
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow"
                      : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> 🔒 All Friends (Circle Only)
                </button>
              )}
            </div>

            {/* Direct Friend Search & Selection (Only if user has friends) */}
            {!isGuest && friends.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <input
                  type="text"
                  placeholder="Or send directly to a specific friend..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
                />

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {filteredFriends.map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setRecipient(f.display_name)}
                      className={`h-8 px-3 rounded-lg text-[11px] font-bold transition border shrink-0 cursor-pointer ${
                        recipient === f.display_name
                          ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow"
                          : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      🎯 {f.display_name} (@{f.username})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Star Rating Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Your Star Rating</label>
              <span className="text-xs font-black text-[var(--star-accent)] flex items-center gap-1">
                <Star className="w-4 h-4 fill-[var(--star-accent)] text-[var(--star-accent)]" /> {ratingStars.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[var(--canvas)] p-2 rounded-2xl border border-[var(--surface-border)]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className={`flex-1 h-9 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                    ratingStars >= star
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                      : "bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Review Note (Optional) */}
          <div className="space-y-1 w-full">
            <label className="text-xs font-bold text-[var(--text-secondary)]">
              Review Note <span className="font-normal opacity-75">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why should people watch this? Share your personal thoughts..."
              className="w-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl p-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition resize-none"
            />
          </div>

          {/* Vibe Tag Chips */}
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Vibe Tags</label>
            <div className="flex gap-2 mb-2 w-full">
              <input
                type="text"
                placeholder="Add custom tag (e.g. Masterpiece)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="flex-1 h-9 px-3 bg-[var(--canvas)] border border-[var(--surface-border)] text-[11px] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
              />
              <Button
                type="button"
                onClick={handleAddCustomTag}
                className="h-9 px-3 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-[11px] rounded-lg transition cursor-pointer"
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border transition cursor-pointer ${
                      isSelected
                        ? "bg-[var(--brand-accent)]/15 border-[var(--brand-accent)] text-[var(--text-primary)]"
                        : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Post Recommendation to {recipient === "Global" ? "Global Feed" : recipient}
          </Button>
        </form>

      </div>
    </div>
  );
}
