"use client";

import { Card, Badge, Avatar, Button, IconButton } from "@usefragments/ui";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Star, Sparkles, Bookmark, Check, Target } from "lucide-react";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genre: string;
  friendName?: string;
  friendAvatarId?: string;
  friendRating?: number;
  friendNote?: string;
  recipient?: string;
  tags?: string[];
  tmdbRating?: number;
  onCardClick?: () => void;
  onRecommendClick?: (e: React.MouseEvent) => void;
  onWatchlistClick?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
}

export function MovieCard({
  id,
  title,
  posterPath,
  releaseYear,
  genre,
  friendName,
  friendAvatarId,
  friendRating = 5.0,
  friendNote,
  recipient,
  tags,
  tmdbRating,
  onCardClick,
  onRecommendClick,
  onWatchlistClick,
  isSaved = false,
}: MovieCardProps) {
  const isDirectForYou = recipient === "You" || recipient === "Tony Stark";

  return (
    <Card
      onClick={onCardClick}
      className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
    >
      {/* 2:3 Vertical Movie Poster */}
      <div className="relative aspect-[2/3] bg-black/60 overflow-hidden">
        <img
          src={getTMDBImageUrl(posterPath, "w500")}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-90" />

        {/* Top Badges: Direct Rec & Star Rating */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-10">
          {isDirectForYou ? (
            <Badge className="bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Target className="w-3 h-3" /> Direct For You
            </Badge>
          ) : (
            <span />
          )}

          <Badge className="bg-black/75 backdrop-blur-md text-[var(--star-accent)] font-extrabold text-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-[var(--star-accent)] text-[var(--star-accent)]" />
            {friendRating ? friendRating.toFixed(1) : tmdbRating?.toFixed(1) || "5.0"}
          </Badge>
        </div>
      </div>

      {/* Card Content & Review Note */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-base text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)] transition">
              {title}
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-bold shrink-0">{releaseYear}</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] font-medium truncate">{genre}</p>

          {/* Friend Quote & Review Note */}
          {friendNote && (
            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)] space-y-1 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] font-extrabold">
                <Avatar className="w-5 h-5 text-[10px] bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black flex items-center justify-center rounded-full">
                  {friendName ? friendName[0] : "F"}
                </Avatar>
                <span>{friendName} says:</span>
              </div>
              <p className="text-xs text-[var(--text-primary)] italic line-clamp-2 leading-relaxed">
                &quot;{friendNote}&quot;
              </p>
            </div>
          )}

          {/* Vibe Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] border border-[var(--surface-border)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Row: Recommend & Library */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--surface-border)]">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRecommendClick?.(e);
            }}
            className="flex-1 h-10 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Recommend
          </Button>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistClick?.(e);
            }}
            title={isSaved ? "Saved in Library" : "Add to Library"}
            className={`w-10 h-10 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              isSaved
                ? "bg-[var(--brand-accent)]/20 border-[var(--brand-accent)] text-[var(--text-primary)]"
                : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 text-[var(--brand-accent)] stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
