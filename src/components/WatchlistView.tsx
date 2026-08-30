"use client";

import { useState } from "react";
import { Card, Badge, Button, IconButton, EmptyState } from "@usefragments/ui";
import { WatchlistItem, Recommendation } from "@/lib/supabase";
import { getTMDBImageUrl, getMovieTrailerKey } from "@/lib/tmdb";
import { Star, Check, Trash2, Bookmark, Play, Sparkles } from "lucide-react";

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  friendRecommendations: Recommendation[];
  currentUserDisplayName: string;
  onUpdateStatus: (id: string, status: "WANT_TO_WATCH" | "WATCHED", rating?: number) => void;
  onRemove: (id: string) => void;
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
}

export function WatchlistView({
  watchlist,
  friendRecommendations,
  currentUserDisplayName,
  onUpdateStatus,
  onRemove,
  onOpenTrailer,
}: WatchlistViewProps) {
  const [filter, setFilter] = useState<"ALL" | "WANT_TO_WATCH" | "WATCHED" | "RECOMMENDED">("ALL");
  const [ratingModalItem, setRatingModalItem] = useState<WatchlistItem | null>(null);

  const myRecommendations = friendRecommendations.filter((r) => r.sender_name === currentUserDisplayName);

  const displayedList = watchlist.filter((item) => {
    if (filter === "WANT_TO_WATCH") return item.status === "WANT_TO_WATCH";
    if (filter === "WATCHED") return item.status === "WATCHED";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-[var(--star-accent)]" /> Your Watchlist
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Saved movies and TV series queued for your next movie night
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--surface-card)] p-1.5 rounded-2xl sm:rounded-full border border-[var(--surface-border)]">
          <Button
            onClick={() => setFilter("ALL")}
            className={`h-9 px-4 rounded-full text-xs font-bold transition ${
              filter === "ALL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All ({watchlist.length})
          </Button>

          <Button
            onClick={() => setFilter("WANT_TO_WATCH")}
            className={`h-9 px-4 rounded-full text-xs font-bold transition ${
              filter === "WANT_TO_WATCH"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Want to Watch ({watchlist.filter((w) => w.status === "WANT_TO_WATCH").length})
          </Button>

          <Button
            onClick={() => setFilter("WATCHED")}
            className={`h-9 px-4 rounded-full text-xs font-bold transition ${
              filter === "WATCHED"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Watched ({watchlist.filter((w) => w.status === "WATCHED").length})
          </Button>

          <Button
            onClick={() => setFilter("RECOMMENDED")}
            className={`h-9 px-4 rounded-full text-xs font-bold transition flex items-center gap-1 ${
              filter === "RECOMMENDED"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended By You ({myRecommendations.length})
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {(filter !== "RECOMMENDED" && displayedList.length === 0) || (filter === "RECOMMENDED" && myRecommendations.length === 0) ? (
        <EmptyState className="py-16 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-[var(--text-primary)] text-base">No titles in this list</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Browse the Discover tab or search for any movie to add titles to your personal watchlist!
          </p>
        </EmptyState>
      ) : (
        /* 2:3 Vertical Cinematic Poster Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {filter === "RECOMMENDED" ? (
            myRecommendations.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Poster Artwork */}
                <div className="relative aspect-[2/3] bg-black/60 overflow-hidden">
                  <img
                    src={getTMDBImageUrl(item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-90" />

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <Badge className="bg-[var(--brand-accent)] text-[var(--brand-accent-text)] px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow">
                      Recommended
                    </Badge>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)] transition">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      To: {item.recipient}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            displayedList.map((item) => {
            const isWatched = item.status === "WATCHED";

            return (
              <Card
                key={item.id}
                className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Poster Artwork */}
                <div className="relative aspect-[2/3] bg-black/60 overflow-hidden">
                  <img
                    src={getTMDBImageUrl(item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-90" />

                  {/* Status & Rating Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <Badge
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        isWatched
                          ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/40"
                          : "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                      }`}
                    >
                      {isWatched ? "Watched" : "Queued"}
                    </Badge>

                    {item.rating_stars && (
                      <Badge className="bg-black/75 text-[var(--star-accent)] font-extrabold text-xs px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[var(--star-accent)] text-[var(--star-accent)]" />
                        {item.rating_stars.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)] transition">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {item.release_year || "Film"} {item.recommended_by ? `• via ${item.recommended_by}` : ""}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          const key = await getMovieTrailerKey(item.tmdb_id, item.media_type);
                          onOpenTrailer(item.title, key);
                        }}
                        className="flex-1 h-10 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Trailer
                      </Button>

                      <IconButton
                        onClick={() => {
                          if (isWatched) {
                            onUpdateStatus(item.id, "WANT_TO_WATCH");
                          } else {
                            setRatingModalItem(item);
                          }
                        }}
                        className={`h-10 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center ${
                          isWatched
                            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                            : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </IconButton>

                      <IconButton
                        onClick={() => onRemove(item.id)}
                        className="w-10 h-10 rounded-xl bg-[var(--canvas)] hover:bg-red-950/60 border border-[var(--surface-border)] hover:border-red-500/40 text-[var(--text-muted)] hover:text-red-400 transition flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }))}
        </div>
      )}

      {/* Micro Rating Modal when marking as WATCHED */}
      {ratingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="relative w-full max-w-sm bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="font-extrabold text-[var(--text-primary)] text-base">Rate "{ratingModalItem.title}"</h3>
            <p className="text-xs text-[var(--text-secondary)]">How many stars would you give this movie?</p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    onUpdateStatus(ratingModalItem.id, "WATCHED", star);
                    setRatingModalItem(null);
                  }}
                  className="w-10 h-10 rounded-full bg-[var(--canvas)] hover:bg-[var(--brand-accent)] hover:text-[var(--brand-accent-text)] border border-[var(--surface-border)] text-[var(--star-accent)] transition font-extrabold flex items-center justify-center"
                >
                  ★ {star}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onUpdateStatus(ratingModalItem.id, "WATCHED", 5.0);
                  setRatingModalItem(null);
                }}
                className="flex-1 h-11 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow"
              >
                Save 5.0 Rating
              </Button>
              <Button
                onClick={() => setRatingModalItem(null)}
                className="h-11 px-4 bg-[var(--canvas)] text-[var(--text-secondary)] text-xs rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
