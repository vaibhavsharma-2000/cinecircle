"use client";

import { useState, useEffect } from "react";
import { Grid, Card, Badge, Button, Chip, EmptyState } from "@usefragments/ui";
import {
  MovieItem,
  DISCOVERY_CATEGORIES,
  getMoviesByCategory,
  getMovieTrailerKey,
  discoverMoviesWithFilters,
  FilterOptions,
  MOVIE_GENRES,
  STREAMING_PLATFORMS,
} from "@/lib/tmdb";
import { Recommendation, WatchlistItem } from "@/lib/supabase";
import { UserAvatar } from "./UserAvatar";
import { PosterImage } from "./PosterImage";
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
  ArrowUp,
  Tv2,
  Play,
  Info,
} from "lucide-react";
import { GenreFilterDrawer } from "./GenreFilterDrawer";
import { FriendItem } from "@/lib/supabase";

const recToMovie = (rec: Recommendation): MovieItem => ({
  id: rec.tmdb_id,
  title: rec.title,
  overview: rec.note,
  poster_path: rec.poster_path,
  backdrop_path: rec.backdrop_path || null,
  release_date: rec.release_year,
  vote_average: 8.0,
  vote_count: 100,
  media_type: rec.media_type,
});

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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasActiveCustomFilters = Boolean(
    customFilters &&
      ((customFilters.contentType && customFilters.contentType !== "all") ||
        customFilters.genreIds.length > 0 ||
        (customFilters.minRating && customFilters.minRating > 0) ||
        (customFilters.decade && customFilters.decade !== "all") ||
        Boolean(customFilters.providerId))
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

    // Senders should always see their own recommendations in Circle view
    const isSelfSender = Boolean(
      (currentUserDisplayName && r.sender_name.toLowerCase() === currentUserDisplayName.toLowerCase()) ||
      (currentUsername && r.sender_name.toLowerCase() === currentUsername.toLowerCase())
    );
    if (isSelfSender) return true;

    if (r.recipient !== "All Friends") return false;

    // Check if sender is in friends list
    const isFriendSender = friends.some(
      (f) =>
        f.display_name.toLowerCase() === r.sender_name.toLowerCase() ||
        f.username.toLowerCase() === r.sender_name.toLowerCase()
    );

    return Boolean(isFriendSender);
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

  const featuredRec = [...directRecs, ...circleRecs, ...globalRecs].find((r) => r.backdrop_path || r.poster_path);
  const featuredMovie = featuredRec ? recToMovie(featuredRec) : tmdbMovies.find((m) => m.backdrop_path);
  const featuredTitle = featuredMovie ? featuredMovie.title || featuredMovie.name || "Untitled" : "";
  const featuredYear = featuredMovie ? (featuredMovie.release_date || featuredMovie.first_air_date || "").substring(0, 4) : "";
  const featuredSaved = featuredMovie ? watchlist.some((w) => w.tmdb_id === featuredMovie.id) : false;

  const playFeaturedTrailer = async () => {
    if (!featuredMovie) return;
    onOpenTrailer(featuredTitle, await getMovieTrailerKey(featuredMovie.id, featuredMovie.media_type === "tv" ? "tv" : "movie"));
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-300">

      {featuredMovie && (
        <section
          aria-label={`Featured: ${featuredTitle}`}
          className="relative -mx-4 sm:mx-0 -mt-4 sm:mt-0 overflow-hidden sm:rounded-3xl border-y sm:border border-[var(--surface-border)] min-h-[440px] sm:min-h-[480px] flex items-end"
        >
          <PosterImage
            path={featuredMovie.backdrop_path || featuredMovie.poster_path}
            title={featuredTitle}
            size="w1280"
            className="absolute inset-0 w-full h-full [&>svg]:hidden"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/75 to-[var(--bg)]/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/85 via-[var(--bg)]/20 to-transparent" />

          <div className="relative p-6 sm:p-10 max-w-2xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-text)]">
              {featuredRec ? `Recommended by ${featuredRec.sender_name}` : `Tonight's Pick · ${activeCategoryObj.label}`}
            </p>
            <h2 className="font-display text-6xl sm:text-8xl text-[var(--text)] tracking-normal">{featuredTitle}</h2>
            <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
              {featuredYear && <span>{featuredYear}</span>}
              <span className="text-[var(--star-accent)]">
                ★ {(featuredRec ? featuredRec.rating_stars : featuredMovie.vote_average).toFixed(1)}
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-primary)]/85 leading-relaxed line-clamp-3">
              {featuredRec ? `"${featuredRec.note}"` : featuredMovie.overview}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                onClick={playFeaturedTrailer}
                className="h-11 px-6 rounded-full bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--brand-accent-text)] text-sm font-extrabold inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Play Trailer
              </Button>
              <Button
                onClick={() => onOpenMovieDetail(featuredMovie, featuredRec)}
                className="h-11 px-5 rounded-full bg-[var(--surface-card)]/80 backdrop-blur-md hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-4 h-4" /> Details
              </Button>
              <button
                type="button"
                onClick={() => onToggleWatchlist(featuredMovie)}
                aria-label={featuredSaved ? `${featuredTitle} is in your Library` : `Add ${featuredTitle} to Library`}
                aria-pressed={featuredSaved}
                className="w-11 h-11 rounded-full bg-[var(--surface-card)]/80 backdrop-blur-md hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
              >
                {featuredSaved ? <Check className="w-4 h-4 text-[var(--brand-accent)] stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* Section 1: Community & Circle Recommendations */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-5">
          <div className="space-y-1">
            <h2 className="font-display text-4xl sm:text-5xl text-[var(--text-primary)] flex items-center gap-3">
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
                const movieObj = recToMovie(rec);
                const isSaved = watchlist.some((w) => w.tmdb_id === rec.tmdb_id && w.status === "WANT_TO_WATCH");

                return (
                  <Card
                    key={rec.id}
                    onClick={() => onOpenMovieDetail(movieObj, rec)}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] transition cursor-pointer shadow-sm group"
                  >
                    {/* Tiny Poster Left */}
                    <div className="w-full sm:w-24 shrink-0 aspect-[2/3] sm:aspect-auto sm:h-32 rounded-xl bg-black/10 overflow-hidden relative">
                      <PosterImage
                        path={rec.poster_path}
                        title={rec.title}
                        className="w-full h-full group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    {/* Review Content Right */}
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                          <UserAvatar
                            avatarId={rec.sender_avatar}
                            displayName={rec.sender_name}
                            size="sm"
                          />
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
                          {onDeleteRecommendation && rec.sender_name === currentUserDisplayName && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRec(rec);
                            }}
                            title="Delete recommendation"
                            aria-label={`Delete recommendation for ${rec.title}`}
                            className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-[var(--danger-subtle)] border border-[var(--surface-border)] hover:border-[var(--danger-border)] text-[var(--text-muted)] hover:text-[var(--danger)] flex items-center justify-center transition"
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
            <h3 className="font-display text-4xl sm:text-5xl text-[var(--text-primary)] flex items-center gap-2.5">
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
            <SlidersHorizontal className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Filter by Genres 🎛️</span>
            {customFilters && customFilters.genreIds.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[var(--brand-accent)] text-[10px] font-black border border-[var(--brand-accent)]/30">
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
          <div className="p-4 bg-[var(--surface-card)] border border-[var(--brand-accent)]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs font-black text-[var(--brand-accent)] flex items-center gap-1.5 shrink-0">
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
                <span className="px-2.5 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs font-black text-[var(--star-accent)]">
                  ★ {customFilters.minRating.toFixed(1)}+
                </span>
              )}

              {customFilters.decade && customFilters.decade !== "all" && (
                <span className="px-2.5 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-xs font-bold text-[var(--text-secondary)]">
                  {customFilters.decade}
                </span>
              )}

              {customFilters.providerId && (
                <span className="px-2.5 py-1 rounded-full bg-[var(--secondary-subtle)] border border-[var(--secondary-border)] text-xs font-black text-[var(--secondary)] flex items-center gap-1">
                  <Tv2 className="w-3.5 h-3.5" />
                  {STREAMING_PLATFORMS.find((p) => p.id === customFilters.providerId)?.name || "Streaming"}
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
                className="h-8 px-3 rounded-lg text-xs font-bold bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger-border)] hover:opacity-80"
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
        ) : tmdbMovies.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-8 max-w-xl mx-auto shadow-sm animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center mx-auto text-[var(--brand-accent)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">No matching titles found on TMDB</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                No films or series matched all your active filter criteria. Try adjusting your genre or rating filters.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Button
                type="button"
                onClick={() => setIsGenreDrawerOpen(true)}
                className="h-10 px-4 rounded-xl text-xs font-bold bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] transition cursor-pointer"
              >
                Adjust Filters
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setCustomFilters(null);
                  setSelectedCategory("critics");
                }}
                className="h-10 px-5 rounded-xl text-xs font-black bg-[var(--brand-accent)] text-[var(--brand-accent-text)] transition shadow cursor-pointer"
              >
                Reset to Top Rated
              </Button>
            </div>
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
                    className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] transition duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl"
                  >
                    <PosterImage
                      path={movie.poster_path}
                      title={title}
                      className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
                    />
                    <Badge className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-black text-[var(--star-accent)] border border-white/10 shadow">
                      ★ {movie.vote_average.toFixed(1)}
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(movie);
                      }}
                      aria-label={isSaved ? `${title} is in your Library` : `Add ${title} to Library`}
                      aria-pressed={isSaved}
                      className="absolute top-1.5 left-1.5 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                    >
                      {isSaved ? <Check className="w-4 h-4 text-[var(--brand-accent)] stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-3 pt-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                      <h4 className="font-bold text-sm text-white truncate">{title}</h4>
                      <p className="text-xs text-white/70 mt-0.5">{year || "Film"}</p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRecommend(movie);
                        }}
                        className="hidden [@media(hover:hover)]:flex mt-0 max-h-0 opacity-0 group-hover:max-h-12 group-hover:mt-3 group-hover:opacity-100 group-focus-within:max-h-12 group-focus-within:mt-3 group-focus-within:opacity-100 w-full h-10 overflow-hidden bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition-all items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" /> Recommend
                      </Button>
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
              <div className="w-10 h-10 rounded-full bg-[var(--danger-subtle)] text-[var(--danger)] flex items-center justify-center shrink-0">
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
                className="flex-1 h-11 bg-[var(--danger)] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow transition"
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

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top of discovery feed"
          className="fixed bottom-20 md:bottom-8 right-6 z-40 w-11 h-11 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer border border-[var(--surface-border)]"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
