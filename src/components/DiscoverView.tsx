"use client";

import { useState, useEffect } from "react";
import { Grid, Card, Badge, Button, Chip, EmptyState } from "@usefragments/ui";
import {
  MovieItem,
  DISCOVERY_CATEGORIES,
  getMoviesByCategory,
  getMovieTrailerKey,
  getTMDBImageUrl,
  discoverMoviesWithFilters,
  FilterOptions,
  MOVIE_GENRES,
} from "@/lib/tmdb";
import { Recommendation, WatchlistItem } from "@/lib/supabase";
import { MovieCard } from "./MovieCard";
import {
  Sparkles,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  AlertTriangle,
  SlidersHorizontal,
  X,
  Bookmark,
  Check,
  Globe,
} from "lucide-react";
import { GenreFilterDrawer } from "./GenreFilterDrawer";
import { FriendItem } from "@/lib/supabase";

interface DiscoverViewProps {
  onOpenMovieDetail: (movie: MovieItem, rec?: Recommendation) => void;
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
  onOpenRecommend: (movie: MovieItem) => void;
  onToggleWatchlist: (movie: MovieItem) => void;
  onDeleteRecommendation?: (id: string) => void;
  onViewAllRecommendations: () => void;
  watchlist: WatchlistItem[];
  friendRecommendations: Recommendation[];
  friends?: FriendItem[];
  currentUserDisplayName?: string;
  currentUsername?: string;
}

export function DiscoverView({
  onOpenMovieDetail,
  onOpenTrailer,
  onOpenRecommend,
  onToggleWatchlist,
  onDeleteRecommendation,
  onViewAllRecommendations,
  watchlist,
  friendRecommendations,
  friends = [],
  currentUserDisplayName = "Guest",
  currentUsername = "guest",
}: DiscoverViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("critics");
  const [isGenreDrawerOpen, setIsGenreDrawerOpen] = useState(false);
  const [customFilters, setCustomFilters] = useState<FilterOptions | null>(null);
  const [recFilter, setRecFilter] = useState<"CIRCLE" | "GLOBAL" | "DIRECT">("GLOBAL");
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [deletingRec, setDeletingRec] = useState<Recommendation | null>(null);

  // TMDB Algorithmic Discovery Pagination State
  const [tmdbMovies, setTmdbMovies] = useState<MovieItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasActiveCustomFilters = Boolean(
    customFilters &&
      ((customFilters.contentType && customFilters.contentType !== "all") ||
        customFilters.genreIds.length > 0 ||
        (customFilters.minRating && customFilters.minRating > 0) ||
        (customFilters.decade && customFilters.decade !== "all"))
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setPage(1);
      if (hasActiveCustomFilters && customFilters) {
        const res = await discoverMoviesWithFilters({ ...customFilters, page: 1 });
        setTmdbMovies(res.results);
      } else {
        const categoryResults = await getMoviesByCategory(selectedCategory, 1);
        setTmdbMovies(categoryResults);
      }
      setIsLoading(false);
    }
    loadData();
  }, [selectedCategory, customFilters, hasActiveCustomFilters]);

  const handleLoadMoreTMDB = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    let moreMovies: MovieItem[] = [];

    if (hasActiveCustomFilters && customFilters) {
      const res = await discoverMoviesWithFilters({ ...customFilters, page: nextPage });
      moreMovies = res.results;
    } else {
      moreMovies = await getMoviesByCategory(selectedCategory, nextPage);
    }

    // Deduplicate by ID
    const existingIds = new Set(tmdbMovies.map((m) => m.id));
    const uniqueNew = moreMovies.filter((m) => !existingIds.has(m.id));

    setTmdbMovies((prev) => [...prev, ...uniqueNew]);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

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

    // Check if sender is in friends list
    const isFriendSender = friends.some(
      (f) =>
        f.display_name.toLowerCase() === r.sender_name.toLowerCase() ||
        f.username.toLowerCase() === r.sender_name.toLowerCase()
    );
    // Or if sender is current user
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

  // Default filter: Circle if user has circle recs, otherwise Global
  const activeFilter =
    recFilter === "CIRCLE" && circleRecs.length === 0 && globalRecs.length > 0
      ? "GLOBAL"
      : recFilter;

  const displayedRecsAll =
    activeFilter === "CIRCLE"
      ? circleRecs
      : activeFilter === "DIRECT"
      ? directRecs
      : globalRecs;

  const visibleRecs = showAllRecs ? displayedRecsAll : displayedRecsAll.slice(0, 3);

  const activeCategoryObj =
    DISCOVERY_CATEGORIES.find((c) => c.id === selectedCategory) || DISCOVERY_CATEGORIES[0];

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      
      {/* Section 1: Community & Circle Recommendations */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
              {activeFilter === "CIRCLE" ? (
                <>
                  <Users className="w-7 h-7 text-[var(--text-primary)]" /> From Your Circle
                </>
              ) : activeFilter === "DIRECT" ? (
                <>
                  <Target className="w-7 h-7 text-[var(--brand-accent)]" /> Sent Directly to You
                </>
              ) : (
                <>
                  <Globe className="w-7 h-7 text-[var(--brand-accent)]" /> Global Community Picks
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {activeFilter === "CIRCLE"
                ? "Private reviews and recommendations shared within your circle"
                : activeFilter === "DIRECT"
                ? "Special picks recommended specifically for your movie night"
                : "Hand-picked film and series recommendations from the CineCircle community"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--surface-card)] p-1.5 rounded-full border border-[var(--surface-border)] text-xs self-start sm:self-auto flex-wrap">
            <Button
              onClick={() => setRecFilter("GLOBAL")}
              className={`px-3.5 h-8 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "GLOBAL"
                  ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Global ({globalRecs.length})
            </Button>

            <Button
              onClick={() => setRecFilter("CIRCLE")}
              className={`px-3.5 h-8 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "CIRCLE"
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
                  activeFilter === "DIRECT"
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow font-extrabold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-0"
                }`}
              >
                <Target className="w-3.5 h-3.5" /> For You ({directRecs.length})
              </Button>
            )}
          </div>
        </div>

        {visibleRecs.length === 0 ? (
          <EmptyState className="p-10 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-2 max-w-md mx-auto">
            <p className="text-sm font-extrabold text-[var(--text-primary)]">No direct recommendations yet</p>
            <p className="text-xs text-[var(--text-secondary)]">Tell your friends to send you specific movie picks!</p>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              {visibleRecs.map((rec) => {
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
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] transition cursor-pointer shadow-sm group"
                  >
                    {/* Tiny Poster Left */}
                    <div className="w-full sm:w-24 shrink-0 aspect-[2/3] sm:aspect-auto sm:h-32 rounded-xl bg-black/10 overflow-hidden relative">
                      <img
                        src={getTMDBImageUrl(rec.poster_path, "w500")}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    {/* Review Content Right */}
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                          <span className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center text-[10px]">
                            {rec.sender_name[0]}
                          </span>
                          <span className="text-[var(--text-primary)]">{rec.sender_name}</span>
                          <span>recommended</span>
                          <span className="text-[var(--text-primary)] font-extrabold">{rec.title}</span>
                        </div>
                        <Badge className="bg-[var(--canvas)] text-[var(--star-accent)] font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-[var(--surface-border)]">
                          ★ {rec.rating_stars.toFixed(1)}
                        </Badge>
                      </div>

                      <p className="text-sm text-[var(--text-primary)] italic leading-relaxed pl-2 border-l-2 border-[var(--surface-border)]">
                        "{rec.note}"
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-1.5">
                          {rec.tags?.map((tag) => (
                            <span key={tag} className="text-[9px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)] bg-[var(--canvas)] px-2 py-0.5 rounded-full border border-[var(--surface-border)]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist(movieObj);
                            }}
                            className={`h-8 px-3 rounded-full text-[10px] font-bold border transition ${
                              isSaved ? "bg-[var(--text-primary)] text-[var(--canvas)] border-[var(--text-primary)]" : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {isSaved ? "Saved" : "+ Watchlist"}
                          </Button>

                          {/* Delete Recommendation Trigger Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRec(rec);
                            }}
                            title="Delete recommendation"
                            className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-red-500/15 border border-[var(--surface-border)] hover:border-red-500/40 text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Expand / View All Button */}
            {displayedRecsAll.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  onClick={onViewAllRecommendations}
                  className="h-11 px-6 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs font-extrabold text-[var(--text-primary)] transition inline-flex items-center gap-2 shadow-lg"
                >
                  <span>View All Recommendations ({displayedRecsAll.length})</span>
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 2: Curated Collections Category Selector */}
      <section className="space-y-6 pt-4 border-t border-[var(--surface-border)]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[var(--text-primary)]" /> Curated Collections
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Discover top-rated films and series across genre collections
            </p>
          </div>
          <Badge className="text-xs text-[var(--text-secondary)] bg-[var(--surface-card)] px-4 h-9 rounded-full border border-[var(--surface-border)] hidden sm:flex items-center font-bold">
            Updated Daily
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom Multi-Genre Discovery Studio Trigger Button */}
          <Button
            onClick={() => setIsGenreDrawerOpen(true)}
            className={`h-11 px-5 rounded-full font-black text-xs flex items-center gap-2 transition border shadow-md cursor-pointer ${
              hasActiveCustomFilters
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)]/30"
                : "bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--surface-border)] hover:border-[var(--brand-accent)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filter by Genres 🎛️</span>
            {customFilters && customFilters.genreIds.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-amber-400 text-[10px] font-black border border-amber-500/30">
                {customFilters.genreIds.length}
              </span>
            )}
          </Button>

          {DISCOVERY_CATEGORIES.map((cat) => {
            const isSelected = !hasActiveCustomFilters && selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                onClick={() => {
                  setCustomFilters(null);
                  setSelectedCategory(cat.id);
                }}
                className={`h-11 px-5 rounded-full font-extrabold text-xs flex items-center gap-2 transition border ${
                  isSelected
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-md"
                    : "bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--surface-border)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* Category or Custom Filters Results Grid */}
      <section className="space-y-6">
        {/* Active Custom Filter Feedback Banner */}
        {hasActiveCustomFilters && customFilters && (
          <div className="p-4 bg-[var(--surface-card)] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Active Discovery Filters:
              </span>

              {customFilters.contentType && customFilters.contentType !== "all" && (
                <span className="px-2.5 py-1 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] text-xs font-black flex items-center gap-1 shadow-sm">
                  {customFilters.contentType === "movie" && "🎬 Feature Movies"}
                  {customFilters.contentType === "tv" && "📺 TV Series"}
                  {customFilters.contentType === "documentary" && "📽️ Documentaries"}
                </span>
              )}

              {customFilters.genreIds.map((gId) => {
                const gObj = MOVIE_GENRES.find((g) => g.id === gId);
                return (
                  <span
                    key={gId}
                    className="px-2.5 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1"
                  >
                    {gObj?.emoji} {gObj?.name}
                  </span>
                );
              })}

              {customFilters.minRating && customFilters.minRating > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs font-black text-amber-400">
                  ★ {customFilters.minRating.toFixed(1)}+
                </span>
              )}

              {customFilters.decade && customFilters.decade !== "all" && (
                <span className="px-2.5 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs font-bold text-[var(--text-secondary)]">
                  {customFilters.decade}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsGenreDrawerOpen(true)}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)]"
              >
                Adjust Filters
              </Button>
              <Button
                onClick={() => setCustomFilters(null)}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/60"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {hasActiveCustomFilters
                ? customFilters?.contentType === "tv"
                  ? "TV Series & Shows Discovery"
                  : customFilters?.contentType === "documentary"
                  ? "Documentaries & Non-Fiction"
                  : "Custom Genre Discovery"
                : activeCategoryObj.label}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {tmdbMovies.length} titles loaded from TMDB
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[var(--surface-card)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-7">
              {tmdbMovies.map((movie) => {
                const title = movie.title || movie.name || "Untitled";
                const year = (movie.release_date || movie.first_air_date || "").substring(0, 4);
                const isSaved = watchlist.some((w) => w.tmdb_id === movie.id && w.status === "WANT_TO_WATCH");

                return (
                  <Card
                    key={movie.id}
                    onClick={() => onOpenMovieDetail(movie)}
                    className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group transition duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer shadow-xl"
                  >
                    <div className="relative aspect-[2/3] bg-black/40 overflow-hidden">
                      <img
                        src={getTMDBImageUrl(movie.poster_path, "w500")}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <Badge className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-black text-[var(--star-accent)] border border-white/10 shadow">
                        ★ {movie.vote_average.toFixed(1)}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)] transition">
                          {title}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{year || "Film"}</p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecommend(movie);
                          }}
                          className="flex-1 h-10 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-current" /> Recommend
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(movie);
                          }}
                          title={isSaved ? "Saved in Library" : "Add to Library"}
                          className={`w-10 h-10 rounded-xl text-xs font-bold border transition flex items-center justify-center p-0 cursor-pointer ${
                            isSaved
                              ? "bg-[var(--brand-accent)]/20 border-[var(--brand-accent)] text-[var(--text-primary)]"
                              : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          {isSaved ? <Check className="w-4 h-4 text-[var(--brand-accent)] stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Load More TMDB Page Button */}
            <div className="text-center pt-6">
              <Button
                onClick={handleLoadMoreTMDB}
                disabled={isLoadingMore}
                className="h-12 px-8 rounded-full bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs transition inline-flex items-center gap-2 shadow-xl hover:scale-105 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Explore More Titles</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Delete Recommendation Confirmation Overlay Modal */}
      {deletingRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <Card className="relative w-full max-w-sm bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Delete Recommendation?</h3>
                <p className="text-xs text-[var(--text-secondary)]">Confirm deletion action</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              Are you sure you want to delete the recommendation for <span className="font-extrabold text-[var(--text-primary)]">"{deletingRec.title}"</span>? This will permanently remove it from your circle feed.
            </p>

            <div className="flex gap-2.5 pt-2">
              <Button
                onClick={() => {
                  if (onDeleteRecommendation) {
                    onDeleteRecommendation(deletingRec.id);
                  }
                  setDeletingRec(null);
                }}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow transition"
              >
                Yes, Delete Recommendation
              </Button>
              <Button
                onClick={() => setDeletingRec(null)}
                className="h-11 px-4 bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl border border-[var(--surface-border)] transition"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Multi-Genre Discovery Studio Drawer */}
      <GenreFilterDrawer
        isOpen={isGenreDrawerOpen}
        onClose={() => setIsGenreDrawerOpen(false)}
        currentFilters={customFilters || { genreIds: [] }}
        onApplyFilters={(filters) => setCustomFilters(filters)}
      />
    </div>
  );
}
