"use client";

import { useState } from "react";
import { Card, Badge, Button, EmptyState } from "@usefragments/ui";
import { MovieItem, getTMDBImageUrl } from "@/lib/tmdb";
import { Recommendation, WatchlistItem } from "@/lib/supabase";
import { Users, Target, Trash2 } from "lucide-react";

interface RecommendationsViewProps {
  friendRecommendations: Recommendation[];
  watchlist: WatchlistItem[];
  onOpenMovieDetail: (movie: MovieItem, rec?: Recommendation) => void;
  onToggleWatchlist: (movie: MovieItem) => void;
  onDeleteRecommendation?: (id: string) => void;
}

export function RecommendationsView({
  friendRecommendations,
  watchlist,
  onOpenMovieDetail,
  onToggleWatchlist,
  onDeleteRecommendation,
}: RecommendationsViewProps) {
  const [recFilter, setRecFilter] = useState<"ALL" | "DIRECT">("ALL");

  const directToMeCount = friendRecommendations.filter(
    (r) => r.recipient === "You" || r.recipient === "Tony Stark"
  ).length;

  const displayedRecs = friendRecommendations.filter((r) => {
    if (recFilter === "DIRECT") {
      return r.recipient === "You" || r.recipient === "Tony Stark";
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[var(--brand-accent)]" /> Friend Recommendations
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Browse all movie and TV show recommendations shared by your circle
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface-card)] p-1.5 rounded-full border border-[var(--surface-border)] text-xs self-start sm:self-auto">
          <Button
            onClick={() => setRecFilter("ALL")}
            className={`px-4 h-9 rounded-full font-bold transition ${
              recFilter === "ALL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Picks ({friendRecommendations.length})
          </Button>
          <Button
            onClick={() => setRecFilter("DIRECT")}
            className={`px-4 h-9 rounded-full font-bold flex items-center gap-1.5 transition ${
              recFilter === "DIRECT"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow font-extrabold"
                : "text-[var(--text-primary)] hover:opacity-80"
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Sent to You ({directToMeCount})
          </Button>
        </div>
      </div>

      {displayedRecs.length === 0 ? (
        <EmptyState className="p-10 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-2 max-w-md mx-auto">
          <p className="text-sm font-extrabold text-[var(--text-primary)]">No recommendations found</p>
          <p className="text-xs text-[var(--text-secondary)]">Tell your friends to send you specific movie picks!</p>
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
              media_type: rec.media_type,
            };
            const isSaved = watchlist.some((w) => w.tmdb_id === rec.tmdb_id && w.status === "WANT_TO_WATCH");

            return (
              <Card
                key={rec.id}
                onClick={() => onOpenMovieDetail(movieObj, rec)}
                className="flex flex-col gap-4 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] transition cursor-pointer shadow-sm group"
              >
                <div className="flex gap-4">
                  {/* Tiny Poster Left */}
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
                      <Badge className="bg-[var(--canvas)] shrink-0 text-[var(--star-accent)] font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-[var(--surface-border)]">
                        ★ {rec.rating_stars.toFixed(1)}
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--text-primary)] italic leading-relaxed pl-2 border-l-2 border-[var(--surface-border)] line-clamp-3">
                      "{rec.note}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {rec.tags?.map((tag) => (
                          <span key={tag} className="text-[9px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)] bg-[var(--canvas)] px-2 py-0.5 rounded-full border border-[var(--surface-border)]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(movieObj);
                          }}
                          className={`h-8 px-3 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                            isSaved ? "bg-[var(--text-primary)] text-[var(--canvas)] border-[var(--text-primary)]" : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {isSaved ? "Saved" : "+ Library"}
                        </Button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteRecommendation) {
                              onDeleteRecommendation(rec.id);
                            }
                          }}
                          title="Delete recommendation"
                          className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-red-500/15 border border-[var(--surface-border)] hover:border-red-500/40 text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
