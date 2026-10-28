"use client";

import { Card, Badge, Avatar, Button, IconButton } from "@usefragments/ui";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Star, Sparkles, Bookmark, Check, Target } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

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
  currentUsername?: string;
  currentUserDisplayName?: string;
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
  currentUsername,
  currentUserDisplayName,
}: MovieCardProps) {
  const isDirectForYou =
    recipient === "You" ||
    (Boolean(currentUsername) && recipient?.toLowerCase() === currentUsername?.toLowerCase()) ||
    (Boolean(currentUserDisplayName) && recipient?.toLowerCase() === currentUserDisplayName?.toLowerCase());

  return (
    <Card
      onClick={onCardClick}
      className="rounded-lg overflow-hidden bg-[var(--surface)] border border-[var(--border)] group hover:outline-1 hover:outline-[var(--accent)] transition-all duration-150 flex flex-col justify-between cursor-pointer shadow-none"
    >
      {/* 2:3 Vertical Movie Poster */}
      <div className="relative aspect-[2/3] bg-[var(--surface-sunken)] overflow-hidden border-b border-[var(--border)]">
        <img
          src={getTMDBImageUrl(posterPath, "w500")}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-200"
        />

        {/* Top Badges: Direct Rec & Star Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
          {isDirectForYou ? (
            <Badge className="bg-[var(--accent)] text-[var(--primary)] font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-none">
              <Target className="w-3 h-3" /> Direct For You
            </Badge>
          ) : (
            <span />
          )}

          <Badge className="bg-[var(--surface)] text-[var(--rating)] font-extrabold text-xs px-2.5 py-0.5 rounded-sm border border-[var(--border)] flex items-center gap-1 shadow-none">
            <Star className="w-3.5 h-3.5 fill-[var(--rating)] text-[var(--rating)]" />
            {friendRating ? friendRating.toFixed(1) : tmdbRating?.toFixed(1) || "5.0"}
          </Badge>
        </div>
      </div>

      {/* Card Content & Review Note */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-[var(--text)] truncate group-hover:text-[var(--text)] transition">
              {title}
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0 uppercase tracking-wider">{releaseYear}</span>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium truncate">{genre}</p>

          {/* Friend Quote & Review Note */}
          {friendNote && (
            <div className="p-2.5 rounded bg-[var(--surface-sunken)] border border-[var(--border)] space-y-1 mt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text)] font-bold">
                <UserAvatar
                  avatarId={friendAvatarId}
                  displayName={friendName || "Friend"}
                  size="xs"
                />
                <span className="uppercase tracking-wider text-[10px] text-[var(--text-muted)]">{friendName} says:</span>
              </div>
              <p className="text-xs text-[var(--text)] italic line-clamp-2 leading-relaxed">
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
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--accent-soft)] text-[var(--text)] border border-transparent"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Row: Recommend & Library */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRecommendClick?.(e);
            }}
            className="flex-1 h-9 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-[var(--on-primary)] text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Recommend
          </Button>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistClick?.(e);
            }}
            title={isSaved ? "Saved in Library" : "Add to Library"}
            className={`w-9 h-9 rounded border transition flex items-center justify-center cursor-pointer ${
              isSaved
                ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--primary)]"
                : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
