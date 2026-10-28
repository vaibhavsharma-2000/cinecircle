"use client";

import { useState } from "react";
import { Badge, Button, IconButton, EmptyState } from "@usefragments/ui";
import { WatchlistItem, Recommendation } from "@/lib/supabase";
import { getTMDBImageUrl, getMovieDetails, MovieItem } from "@/lib/tmdb";
import { StarRatingPicker } from "./StarRatingPicker";
import {
  Star,
  Trash2,
  Bookmark,
  Sparkles,
  Eye,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Maximize2,
} from "lucide-react";

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  friendRecommendations: Recommendation[];
  currentUserDisplayName: string;
  onUpdateStatus: (id: string, status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED", rating?: number) => void;
  onRemove: (id: string) => void;
  onOpenRecommend?: (movie: MovieItem) => void;
  onOpenMovieDetail?: (movie: MovieItem) => void;
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
}

export function WatchlistView({
  watchlist,
  friendRecommendations,
  currentUserDisplayName,
  onUpdateStatus,
  onRemove,
  onOpenRecommend,
  onOpenMovieDetail,
  onOpenTrailer,
}: WatchlistViewProps) {
  const [filter, setFilter] = useState<"ALL" | "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED" | "RECOMMENDED">("ALL");
  const [ratingModalItem, setRatingModalItem] = useState<WatchlistItem | null>(null);
  const [ratingModalValue, setRatingModalValue] = useState<number>(5.0);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [overviews, setOverviews] = useState<Record<number, string>>({});

  const myRecommendations = friendRecommendations.filter((r) => r.sender_name === currentUserDisplayName);

  const wantToWatchCount = watchlist.filter((w) => w.status === "WANT_TO_WATCH").length;
  const watchingCount = watchlist.filter((w) => w.status === "CURRENTLY_WATCHING").length;
  const watchedCount = watchlist.filter((w) => w.status === "WATCHED").length;

  const displayedList = watchlist.filter((item) => {
    if (filter === "WANT_TO_WATCH") return item.status === "WANT_TO_WATCH";
    if (filter === "CURRENTLY_WATCHING") return item.status === "CURRENTLY_WATCHING";
    if (filter === "WATCHED") return item.status === "WATCHED";
    return true;
  });

  const toggleExpand = async (item: WatchlistItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !expandedIds[item.id];
    setExpandedIds((prev) => ({ ...prev, [item.id]: nextState }));

    if (nextState && !overviews[item.tmdb_id]) {
      try {
        const details = await getMovieDetails(item.tmdb_id, item.media_type);
        if (details?.overview) {
          setOverviews((prev) => ({ ...prev, [item.tmdb_id]: details.overview }));
        }
      } catch (err) {
        console.error("Error prefetching overview:", err);
      }
    }
  };

  const getStatusBadge = (status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED") => {
    switch (status) {
      case "CURRENTLY_WATCHING":
        return (
          <Badge className="bg-[var(--accent-soft)] text-[var(--text)] px-2.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none border border-[var(--border)]">
            <Eye className="w-3 h-3" /> Watching
          </Badge>
        );
      case "WATCHED":
        return (
          <Badge className="bg-[var(--primary)] text-[var(--on-primary)] px-2.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none">
            <CheckCircle2 className="w-3 h-3" /> Watched
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[var(--surface-sunken)] text-[var(--text)] px-2.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none border border-[var(--border)]">
            <Bookmark className="w-3 h-3" /> Want to Watch
          </Badge>
        );
    }
  };

  const handleCardClick = (item: WatchlistItem) => {
    if (onOpenMovieDetail) {
      onOpenMovieDetail({
        id: item.tmdb_id,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: null,
        media_type: item.media_type,
        release_date: item.release_year,
        vote_average: item.rating_stars || 8.0,
        vote_count: 100,
        overview: overviews[item.tmdb_id] || "",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-[var(--star-accent)]" /> My Library
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Click any movie title or poster to view synopsis, change watch status, or send recommendations
          </p>
        </div>

        {/* Subtab Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--surface-card)] p-1.5 rounded-2xl sm:rounded-full border border-[var(--surface-border)]">
          <Button
            onClick={() => setFilter("ALL")}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "ALL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            All ({watchlist.length})
          </Button>

          <Button
            onClick={() => setFilter("WANT_TO_WATCH")}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "WANT_TO_WATCH"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            Want to Watch ({wantToWatchCount})
          </Button>

          <Button
            onClick={() => setFilter("CURRENTLY_WATCHING")}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "CURRENTLY_WATCHING"
                ? "bg-[var(--secondary)] text-[var(--secondary-text)] font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            Watching ({watchingCount})
          </Button>

          <Button
            onClick={() => setFilter("WATCHED")}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "WATCHED"
                ? "bg-[var(--success)] text-white font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            Watched ({watchedCount})
          </Button>

          <Button
            onClick={() => setFilter("RECOMMENDED")}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filter === "RECOMMENDED"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended ({myRecommendations.length})
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {(filter !== "RECOMMENDED" && displayedList.length === 0) || (filter === "RECOMMENDED" && myRecommendations.length === 0) ? (
        <EmptyState className="py-16 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-[var(--text-primary)] text-base">No titles in this section</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Browse the Discover tab or search for any movie or TV series to add titles to your personal library!
          </p>
        </EmptyState>
      ) : (
        /* 2:3 Vertical Poster Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {filter === "RECOMMENDED" ? (
            myRecommendations.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Poster Artwork - Clickable */}
                <div
                  onClick={() => {
                    if (onOpenMovieDetail) {
                      onOpenMovieDetail({
                        id: item.tmdb_id,
                        title: item.title,
                        poster_path: item.poster_path,
                        backdrop_path: item.backdrop_path || null,
                        media_type: item.media_type,
                        release_date: item.release_year,
                        vote_average: item.rating_stars,
                        vote_count: 100,
                        overview: item.note,
                      });
                    }
                  }}
                  className="relative aspect-[2/3] bg-black/60 overflow-hidden cursor-pointer group/poster"
                >
                  <img
                    src={getTMDBImageUrl(item.poster_path, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/poster:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-80" />

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <Badge className="bg-[var(--brand-accent)] text-[var(--brand-accent-text)] px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow">
                      Recommended
                    </Badge>
                    <Badge className="bg-[var(--surface)] text-[var(--rating)] font-extrabold text-xs px-2.5 py-1 rounded border border-[var(--border)] flex items-center gap-1 shadow-none">
                      ★ {item.rating_stars.toFixed(1)}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition bg-black/40 backdrop-blur-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-[11px] shadow-lg flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" /> View Details
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenMovieDetail) {
                          onOpenMovieDetail({
                            id: item.tmdb_id,
                            title: item.title,
                            poster_path: item.poster_path,
                            backdrop_path: item.backdrop_path || null,
                            media_type: item.media_type,
                            release_date: item.release_year,
                            vote_average: item.rating_stars,
                            vote_count: 100,
                            overview: item.note,
                          });
                        }
                      }}
                      className="font-extrabold text-sm text-[var(--text-primary)] hover:text-[var(--brand-accent)] hover:underline text-left transition cursor-pointer block w-full truncate"
                    >
                      {item.title}
                    </button>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      To {item.recipient} • {item.release_year}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--surface-border)]">
                    <p className="text-xs text-[var(--text-secondary)] italic line-clamp-2">&quot;{item.note}&quot;</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            displayedList.map((item) => {
              const movieObj: MovieItem = {
                id: item.tmdb_id,
                title: item.title,
                poster_path: item.poster_path,
                backdrop_path: null,
                media_type: item.media_type,
                release_date: item.release_year,
                vote_average: item.rating_stars || 8.0,
                vote_count: 100,
                overview: overviews[item.tmdb_id] || "",
              };

              const isExpanded = !!expandedIds[item.id];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
                >
                  {/* Poster Artwork - Clickable to open full movie details modal */}
                  <div
                    onClick={() => handleCardClick(item)}
                    className="relative aspect-[2/3] bg-black/60 overflow-hidden cursor-pointer group/poster"
                  >
                    <img
                      src={getTMDBImageUrl(item.poster_path, "w500")}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover/poster:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-80 group-hover/poster:opacity-50 transition" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Star Rating Badge if Rated */}
                    {item.rating_stars && item.status === "WATCHED" && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-[var(--surface)] text-[var(--rating)] font-extrabold text-xs px-2.5 py-1 rounded border border-[var(--border)] flex items-center gap-1 shadow-none">
                          <Star className="w-3.5 h-3.5 fill-[var(--rating)] text-[var(--rating)]" />
                          {item.rating_stars.toFixed(1)}
                        </Badge>
                      </div>
                    )}

                    {/* Hover Visual Action Hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition bg-black/40 backdrop-blur-xs">
                      <span className="px-3 py-1.5 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-[11px] shadow-lg flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> Full Details
                      </span>
                    </div>
                  </div>

                  {/* Card Info & Inline Expansion */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Movie Title - Clickable directly to open Movie Details modal */}
                      <button
                        type="button"
                        onClick={() => handleCardClick(item)}
                        className="font-extrabold text-sm text-[var(--text-primary)] hover:text-[var(--brand-accent)] hover:underline text-left transition cursor-pointer flex items-center justify-between w-full group/title"
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="text-[10px] text-[var(--brand-accent)] opacity-0 group-hover/title:opacity-100 transition shrink-0 ml-1">
                          ↗
                        </span>
                      </button>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {item.release_year || "Film"} {item.recommended_by ? `• via ${item.recommended_by}` : ""}
                        </p>

                        {/* Inline Synopsis Accordion Toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(item, e)}
                          className="text-[11px] font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide" : "Synopsis"}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Inline Expanded Synopsis Panel */}
                      {isExpanded && (
                        <div className="mt-2.5 p-2.5 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-xl space-y-2 animate-in fade-in duration-200 text-xs">
                          <p className="italic text-[11px] text-[var(--text-secondary)] line-clamp-4 leading-relaxed">
                            {overviews[item.tmdb_id] || "Fetching synopsis from TMDB..."}
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-[var(--surface-border)]/60 text-[10px]">
                            <span className="font-extrabold uppercase text-[var(--brand-accent)]">
                              {item.media_type === "tv" ? "TV Series" : "Movie"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCardClick(item)}
                              className="font-extrabold text-[var(--brand-accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              Open Full Modal <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-1 border-t border-[var(--surface-border)]">
                      {/* Status Selector Pills on Card */}
                      <div className="grid grid-cols-3 gap-1 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--surface-border)]">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, "WANT_TO_WATCH")}
                          title="Mark Want to Watch"
                          className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                            item.status === "WANT_TO_WATCH"
                              ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm font-extrabold"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Want
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, "CURRENTLY_WATCHING")}
                          title="Mark Currently Watching"
                          className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                            item.status === "CURRENTLY_WATCHING"
                              ? "bg-[var(--secondary)] text-[var(--secondary-text)] shadow-sm font-extrabold"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Watching
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRatingModalValue(item.rating_stars || 5.0);
                            setRatingModalItem(item);
                          }}
                          title="Mark Watched & Rate"
                          className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                            item.status === "WATCHED"
                              ? "bg-[var(--success)] text-white shadow-sm font-extrabold"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Watched
                        </button>
                      </div>

                      {/* Action Row: Recommend & Remove */}
                      <div className="flex items-center gap-2">
                        {onOpenRecommend && (
                          <Button
                            type="button"
                            onClick={() => onOpenRecommend(movieObj)}
                            className="flex-1 h-9 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[var(--star-accent)]" /> Recommend
                          </Button>
                        )}

                        <IconButton
                          onClick={() => onRemove(item.id)}
                          title="Remove from library"
                          className="w-9 h-9 rounded-xl bg-[var(--canvas)] hover:bg-[var(--danger-subtle)] border border-[var(--surface-border)] hover:border-[var(--danger-border)] text-[var(--text-muted)] hover:text-[var(--danger)] transition flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Micro Rating Modal when marking as WATCHED */}
      {ratingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="font-extrabold text-[var(--text-primary)] text-base">Rate &quot;{ratingModalItem.title}&quot;</h3>
            <p className="text-xs text-[var(--text-secondary)]">Select a rating (1.0 - 5.0 with half-stars):</p>

            <div className="p-3 bg-[var(--canvas)] rounded-xl border border-[var(--surface-border)]">
              <StarRatingPicker
                rating={ratingModalValue}
                onChange={(val) => setRatingModalValue(val)}
                size="md"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onUpdateStatus(ratingModalItem.id, "WATCHED", ratingModalValue);
                  setRatingModalItem(null);
                }}
                className="flex-1 h-11 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Save ★ {ratingModalValue.toFixed(1)} Rating
              </Button>
              <Button
                onClick={() => setRatingModalItem(null)}
                className="h-11 px-4 bg-[var(--canvas)] text-[var(--text-secondary)] text-xs rounded-xl border border-[var(--surface-border)] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
