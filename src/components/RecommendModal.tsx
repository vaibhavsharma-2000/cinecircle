"use client";

import { useState } from "react";
import { Button, IconButton, Input, Textarea, Avatar, Badge, Chip } from "@usefragments/ui";
import { MovieItem, getTMDBImageUrl } from "@/lib/tmdb";
import { FriendItem } from "@/lib/supabase";
import { X, Star, Sparkles, Send, Users } from "lucide-react";

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieItem | null;
  friends: FriendItem[];
  onRecommend: (recommendation: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    ratingStars: number;
    note: string;
    tags: string[];
    recipient: string;
  }) => void;
}

export function RecommendModal({
  isOpen,
  onClose,
  movie,
  friends,
  onRecommend,
}: RecommendModalProps) {
  const [ratingStars, setRatingStars] = useState(5.0);
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState("All Friends");
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

  const extractValue = (val: any): string => {
    if (typeof val === "string") return val;
    if (val && val.target && typeof val.target.value === "string") return val.target.value;
    return "";
  };

  if (!isOpen || !movie) return null;

  const title = movie.title || movie.name || "Movie";

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/[^a-zA-Z0-9]/g, '');
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
      ratingStars,
      note: note.trim() || "Recommended by your friend!",
      tags: selectedTags,
      recipient,
    });

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
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Recommend to Friend</h3>
              <p className="text-xs text-[var(--text-secondary)]">Share your star rating and review note</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
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
              {(movie.release_date || movie.first_air_date || "").substring(0, 4)} • TMDB ★ {movie.vote_average.toFixed(1)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Recipient Picker with Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--brand-accent)]" /> Select Recipient
            </label>
            <input
              type="text"
              placeholder="Search friends..."
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              className="w-full h-10 px-3.5 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition mb-2"
            />
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              <Button
                type="button"
                onClick={() => setRecipient("All Friends")}
                className={`h-9 px-4 rounded-full text-xs font-bold transition border shrink-0 ${
                  recipient === "All Friends"
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow"
                    : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                }`}
              >
                🌐 All Friends
              </Button>

              {filteredFriends.map((f) => (
                <Button
                  type="button"
                  key={f.id}
                  onClick={() => setRecipient(f.display_name)}
                  className={`h-9 px-4 rounded-full text-xs font-bold transition border shrink-0 ${
                    recipient === f.display_name
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow"
                      : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  🎯 {f.display_name}
                </Button>
              ))}
            </div>
          </div>

          {/* Star Rating Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Your Rating</label>
              <span className="text-xs font-black text-[var(--star-accent)] flex items-center gap-1">
                <Star className="w-4 h-4 fill-[var(--star-accent)] text-[var(--star-accent)]" /> {ratingStars.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[var(--canvas)] p-2.5 rounded-2xl border border-[var(--surface-border)]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className={`flex-1 h-10 rounded-xl font-extrabold text-xs transition ${
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
              Review Note for Recipient <span className="font-normal opacity-75">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why should your friend watch this? (Optional note)..."
              className="w-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl p-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition resize-none"
            />
          </div>

          {/* Vibe Tag Chips */}
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Select or Add Vibe Tags</label>
            <div className="flex gap-2 mb-2 w-full">
              <input
                type="text"
                placeholder="Add custom tag (e.g. Tearjerker)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="flex-1 h-9 px-3 bg-[var(--canvas)] border border-[var(--surface-border)] text-[11px] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
              />
              <Button
                type="button"
                onClick={handleAddCustomTag}
                className="h-9 px-3 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-[11px] rounded-lg transition"
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-full border transition cursor-pointer ${
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
            className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Recommendation to {recipient}
          </Button>
        </form>

      </div>
    </div>
  );
}
