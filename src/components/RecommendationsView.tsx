"use client";

import { useState } from "react";
import { Card, Badge, Button, EmptyState } from "@usefragments/ui";
import { MovieItem, getTMDBImageUrl } from "@/lib/tmdb";
import { Recommendation, WatchlistItem, FriendItem } from "@/lib/supabase";
import { Users, Target, Trash2, Globe, Sparkles } from "lucide-react";

interface RecommendationsViewProps {
  friendRecommendations: Recommendation[];
  watchlist: WatchlistItem[];
  friends?: FriendItem[];
  currentUserDisplayName?: string;
  currentUsername?: string;
  onOpenMovieDetail: (movie: MovieItem, rec?: Recommendation) => void;
  onToggleWatchlist: (movie: MovieItem) => void;
  onDeleteRecommendation?: (id: string) => void;
}

export function RecommendationsView({
  friendRecommendations,
  watchlist,
  friends = [],
  currentUserDisplayName = "Guest",
  currentUsername = "guest",
  onOpenMovieDetail,
  onToggleWatchlist,
  onDeleteRecommendation,
}: RecommendationsViewProps) {
  const [recFilter, setRecFilter] = useState<"ALL" | "CIRCLE" | "GLOBAL" | "DIRECT">("GLOBAL");

  const isDirectRec = (r: Recommendation) => {
    if (r.recipient === "Global" || r.recipient === "All Friends") return false;
    if (r.recipient === "You") return true;
    if (currentUserDisplayName && r.recipient.toLowerCase() === currentUserDisplayName.toLowerCase()) return true;
    if (currentUsername && r.recipient.toLowerCase() === currentUsername.toLowerCase()) return true;
    return false;
  };

  const isCircleRec = (r: Recommendation) => {
    if (isDirectRec(r)) return true;
    if (r.recipient !== "All Friends") return false;

    const isFriendSender = friends.some(
      (f) =>
        f.display_name.toLowerCase() === r.sender_name.toLowerCase() ||
        f.username.toLowerCase() === r.sender_name.toLowerCase()
    );
    const isSelfSender =
      currentUserDisplayName &&
      r.sender_name.toLowerCase() === currentUserDisplayName.toLowerCase();

    return Boolean(isFriendSender || isSelfSender);
  };

  const isGlobalRec = (r: Recommendation) => {
    return r.recipient === "Global";
  };

  const circleRecs = friendRecommendations.filter(isCircleRec);
  const globalRecs = friendRecommendations.filter(isGlobalRec);
  const directRecs = friendRecommendations.filter(isDirectRec);

  const displayedRecs =
    recFilter === "CIRCLE"
      ? circleRecs
      : recFilter === "GLOBAL"
      ? globalRecs
      : recFilter === "DIRECT"
      ? directRecs
      : friendRecommendations;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[var(--brand-accent)]" /> CineCircle Feeds
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Browse recommendations from your private circle and the global film community
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--surface-card)] p-1.5 rounded-full border border-[var(--surface-border)] text-xs self-start sm:self-auto flex-wrap">
          <Button
            onClick={() => setRecFilter("GLOBAL")}
            className={`px-3.5 h-8 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
              recFilter === "GLOBAL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Global ({globalRecs.length})
          </Button>

          <Button
            onClick={() => setRecFilter("CIRCLE")}
            className={`px-3.5 h-8 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
              recFilter === "CIRCLE"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Circle ({circleRecs.length})
          </Button>

          {directRecs.length > 0 && (
            <Button
              onClick={() => setRecFilter("DIRECT")}
              className={`px-3.5 h-8 rounded-full font-bold flex items-center gap-1.5 transition cursor-pointer ${
                recFilter === "DIRECT"
                  ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow font-extrabold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
              }`}
            >
              <Target className="w-3.5 h-3.5" /> For You ({directRecs.length})
            </Button>
          )}

          <Button
            onClick={() => setRecFilter("ALL")}
            className={`px-3.5 h-8 rounded-full font-bold transition cursor-pointer ${
              recFilter === "ALL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            All ({friendRecommendations.length})
          </Button>
        </div>
      </div>

      {displayedRecs.length === 0 ? (
        <EmptyState className="p-10 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-2 max-w-md mx-auto">
          <p className="text-sm font-extrabold text-[var(--text-primary)]">No recommendations found</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {recFilter === "CIRCLE"
              ? "Your circle friends haven't posted any recommendations yet. Recommend a film to get the circle started!"
              : "No picks match this view. Check back soon for new community recommendations!"}
          </p>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedRecs.map((rec) => {
            const movieObj: MovieItem = {
              id: rec.tmdb_id,
              title: rec.title,
              overview: rec.note,
              poster_path: rec.poster_path,
              backdrop_path: rec.backdrop_path || null,
              release_date: rec.release_year,
              vote_average: 8.0,
              vote_count: 100,
              media_type: rec.media_type || "movie",
            };
            const isSaved = watchlist.some((w) => w.tmdb_id === rec.tmdb_id && w.status === "WANT_TO_WATCH");

            return (
              <Card
                key={rec.id}
                onClick={() => onOpenMovieDetail(movieObj, rec)}
                className="flex flex-col gap-4 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] transition cursor-pointer shadow-sm group"
              >
                <div className="flex gap-4">
                  {/* Poster Left */}
                  <div className="w-20 shrink-0 aspect-[2/3] rounded-xl bg-black/10 overflow-hidden relative">
                    <img
                      src={getTMDBImageUrl(rec.poster_path, "w500")}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Review Content Right */}
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] flex-wrap">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center text-[10px]">
                          {rec.sender_name[0]}
                        </span>
                        <span className="text-[var(--text-primary)]">{rec.sender_name}</span>
                        <span>recommended</span>
                        <span className="text-[var(--text-primary)] font-extrabold">{rec.title}</span>
                      </div>
                      <Badge className="bg-[var(--canvas)] text-[var(--star-accent)] font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-[var(--surface-border)] shrink-0">
                        ★ {rec.rating_stars.toFixed(1)}
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--text-primary)] italic leading-relaxed pl-2 border-l-2 border-[var(--surface-border)]">
                      &quot;{rec.note}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rec.recipient === "Global" ? (
                          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] border border-[var(--brand-accent)]/30">
                            🌍 Global
                          </span>
                        ) : rec.recipient === "All Friends" ? (
                          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            🔒 Circle
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            🎯 Direct
                          </span>
                        )}

                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] border border-[var(--surface-border)] uppercase">
                          {rec.media_type === "tv" ? "TV Series" : "Movie"}
                        </span>

                        {rec.tags && rec.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] border border-[var(--surface-border)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {onDeleteRecommendation && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRecommendation(rec.id);
                          }}
                          className="text-[var(--text-muted)] hover:text-red-400 p-1 transition cursor-pointer"
                          title="Delete Recommendation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
