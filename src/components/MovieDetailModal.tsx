"use client";

import { useState, useEffect } from "react";
import { Badge, Button, IconButton } from "@usefragments/ui";
import {
  MovieItem,
  getMovieDetails,
  getWatchProviders,
  getMovieCredits,
  CastMember,
  getMovieTrailerKey,
  getTMDBImageUrl,
  WatchProvidersResult,
} from "@/lib/tmdb";
import {
  Star,
  X,
  Play,
  Plus,
  Check,
  Sparkles,
  Tv,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Bookmark,
  Eye,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { WatchlistItem, supabase } from "@/lib/supabase";
import { subscribeToComments } from "@/lib/sync";
import { CastFilmographyModal } from "./CastFilmographyModal";

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number | null;
  mediaType?: "movie" | "tv";
  initialMovie?: MovieItem | null;
  recommendationNote?: string;
  recommendedBy?: string;
  ratingStars?: number;
  currentUserDisplayName?: string;
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
  onOpenRecommend: (movie: MovieItem) => void;
  onToggleWatchlist: (movie: MovieItem) => void;
  onSetWatchStatus?: (
    movie: MovieItem,
    status: "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED" | "NONE",
    rating?: number
  ) => void;
  watchlist: WatchlistItem[];
}

export function MovieDetailModal({
  isOpen,
  onClose,
  movieId,
  mediaType = "movie",
  initialMovie,
  recommendationNote,
  recommendedBy,
  ratingStars,
  currentUserDisplayName = "You",
  onOpenTrailer,
  onOpenRecommend,
  onToggleWatchlist,
  onSetWatchStatus,
  watchlist,
}: MovieDetailModalProps) {
  const [movie, setMovie] = useState<MovieItem | null>(initialMovie || null);
  const [providers, setProviders] = useState<WatchProvidersResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cinecircle_streaming_country") || "DE";
    }
    return "DE";
  });
  const [cast, setCast] = useState<CastMember[]>([]);
  const [filmographyPerson, setFilmographyPerson] = useState<{ id: number; name: string } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{author: string; text: string}[]>([]);

  const handleSelectCountry = (code: string) => {
    setSelectedCountry(code);
    try {
      localStorage.setItem("cinecircle_streaming_country", code);
    } catch (e) {}
  };

  // Fetch comments from Supabase when opening a modal
  useEffect(() => {
    if (!isOpen || !movieId) return;

    const recId = recommendationNote ? `${movieId}_${recommendedBy}` : `movie_${movieId}`;

    async function fetchComments() {
      const { data, error } = await supabase
        .from("recommendation_comments")
        .select("*")
        .eq("recommendation_id", recId)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setComments(data.map((c: any) => ({ author: c.author_name, text: c.comment_text })));
      } else {
        setComments([]);
      }
    }

    fetchComments();
    setNewComment("");

    // Realtime comment stream
    const unsubscribe = subscribeToComments(recId, (newComm: any) => {
      setComments((prev) => {
        const alreadyExists = prev.some(
          (c) => c.author === newComm.author_name && c.text === newComm.comment_text
        );
        if (alreadyExists) return prev;
        return [...prev, { author: newComm.author_name, text: newComm.comment_text }];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, movieId, recommendationNote, recommendedBy]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentText = newComment.trim();
    const author = currentUserDisplayName;
    const recId = recommendationNote ? `${movieId}_${recommendedBy}` : `movie_${movieId}`;

    // Optimistic UI update
    setComments((prev) => [...prev, { author, text: commentText }]);
    setNewComment("");

    // Persist to Supabase
    await supabase.from("recommendation_comments").insert([
      {
        recommendation_id: recId,
        tmdb_id: movieId,
        author_name: author,
        comment_text: commentText,
      },
    ]);
  };

  useEffect(() => {
    if (!isOpen || !movieId) return;

    async function loadData() {
      setIsLoading(true);
      const [details, watchData, creditsData] = await Promise.all([
        getMovieDetails(movieId!, mediaType),
        getWatchProviders(movieId!, mediaType, selectedCountry),
        getMovieCredits(movieId!, mediaType),
      ]);
      if (details) setMovie(details);
      setProviders(watchData);
      setCast(creditsData);
      setIsLoading(false);
    }

    loadData();
  }, [isOpen, movieId, mediaType]);

  // Refetch watch providers when user switches country
  useEffect(() => {
    if (isOpen && movieId) {
      getWatchProviders(movieId, mediaType, selectedCountry).then((res) => {
        setProviders(res);
      });
    }
  }, [selectedCountry, isOpen, movieId, mediaType]);

  if (!isOpen || !movieId) return null;

  const currentMovie = movie || initialMovie || {
    id: movieId,
    title: "Movie Details",
    overview: "Loading synopsis...",
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.0,
    vote_count: 100,
    media_type: mediaType,
  };

  const title = currentMovie.title || currentMovie.name || "Movie Details";
  const posterPath = currentMovie.poster_path;
  const backdropPath = currentMovie.backdrop_path;
  const releaseYear = (currentMovie.release_date || currentMovie.first_air_date || "").substring(0, 4);
  const overview = currentMovie.overview || "No synopsis available for this title.";
  const voteAverage = currentMovie.vote_average || 8.0;

  const currentWatchItem = watchlist.find((w) => w.tmdb_id === movieId);
  const isSaved = !!currentWatchItem;

  const handleTrailer = async () => {
    const key = await getMovieTrailerKey(movieId, mediaType);
    onOpenTrailer(title, key);
  };

  const handleRecommendClick = () => {
    onClose();
    onOpenRecommend(currentMovie);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Top Widescreen Backdrop Banner */}
        <div className="relative aspect-[21/9] bg-black/60 overflow-hidden shrink-0">
          <img
            src={getTMDBImageUrl(backdropPath || posterPath, "original")}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/50 to-transparent" />
          
          <IconButton
            onClick={onClose}
            aria-label="Close details window"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 transition z-10"
          >
            <X className="w-5 h-5" />
          </IconButton>

          {/* Rating Scores */}
          <div className="absolute bottom-4 left-6 flex flex-wrap items-center gap-2">
            <Badge className="px-3.5 h-8 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] text-xs font-black flex items-center gap-1 shadow">
              <Star className="w-3.5 h-3.5 fill-current" /> {voteAverage.toFixed(1)} / 10 TMDB
            </Badge>
            {recommendedBy && (
              <Badge className="px-3.5 h-8 rounded-full bg-black/80 text-[var(--star-accent)] text-xs font-bold border border-[var(--star-accent)]/40 flex items-center">
                ⭐ {ratingStars ? ratingStars.toFixed(1) : "5.0"} by {recommendedBy}
              </Badge>
            )}
          </div>
        </div>

        {/* Modal Scrollable Info Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Movie Title & Info Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] pt-1">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {releaseYear || "N/A"}</span>
              {movie?.runtime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.runtime} min</span>}
              <Badge className="uppercase text-[10px] font-bold px-3 py-1 rounded-full bg-[var(--canvas)] border border-[var(--surface-border)] text-[var(--text-primary)]">
                {mediaType === "tv" ? "TV Series" : "Feature Film"}
              </Badge>
            </div>
          </div>

          {/* Friend Review Quote & Thread if recommended */}
          {recommendationNote && (
            <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-primary)] block">
                  Friend Review by {recommendedBy}:
                </span>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] italic leading-relaxed">
                  "{recommendationNote}"
                </p>
              </div>
              
              {/* Comments Thread */}
              <div className="space-y-3 pt-3 border-t border-[var(--surface-border)]">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Discussion Thread</h4>
                
                {comments.length > 0 && (
                  <div className="space-y-3 mb-3">
                    {comments.map((comment, idx) => (
                      <div key={idx} className="flex gap-2 text-xs bg-[var(--surface-card)] p-2.5 rounded-lg border border-[var(--surface-border)]">
                        <div className="font-bold text-[var(--brand-accent)]">{comment.author}:</div>
                        <div className="text-[var(--text-primary)]">{comment.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Reply to this recommendation..."
                    className="flex-1 h-10 px-3 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button
                    onClick={handleAddComment}
                    className="h-10 px-4 bg-[var(--text-primary)] text-[var(--canvas)] hover:opacity-90 font-bold text-xs rounded-xl transition"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Synopsis & Description</h3>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
              {overview}
            </p>
          </div>

          {/* Where to Stream / Watch Providers with Regional Country Selector */}
          <div className="space-y-3 pt-3 border-t border-[var(--surface-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                <Tv className="w-4 h-4 text-[var(--brand-accent)]" /> Where to Stream
              </h3>

              {/* Regional Country Selector in order: Germany, India, Canada, USA, UK, Australia */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { code: "DE", label: "🇩🇪 Germany" },
                  { code: "IN", label: "🇮🇳 India" },
                  { code: "CA", label: "🇨🇦 Canada" },
                  { code: "US", label: "🇺🇸 USA" },
                  { code: "GB", label: "🇬🇧 UK" },
                  { code: "AU", label: "🇦🇺 Australia" },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c.code)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition shrink-0 cursor-pointer ${
                      selectedCountry === c.code
                        ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                        : "bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {providers?.flatrate && providers.flatrate.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[var(--text-secondary)]">Subscription Streaming:</p>
                <div className="flex flex-wrap gap-2.5">
                  {providers.flatrate.map((prov) => (
                    <div
                      key={prov.provider_id}
                      className="flex items-center gap-2 bg-[var(--canvas)] p-2 rounded-xl border border-[var(--surface-border)] shadow-sm"
                    >
                      <img
                        src={getTMDBImageUrl(prov.logo_path, "w500")}
                        alt={prov.provider_name}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">{prov.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : providers?.rent && providers.rent.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[var(--text-secondary)]">Available to Rent / Purchase:</p>
                <div className="flex flex-wrap gap-2.5">
                  {providers.rent.slice(0, 4).map((prov) => (
                    <div
                      key={prov.provider_id}
                      className="flex items-center gap-2 bg-[var(--canvas)] p-2 rounded-xl border border-[var(--surface-border)] shadow-sm"
                    >
                      <img
                        src={getTMDBImageUrl(prov.logo_path, "w500")}
                        alt={prov.provider_name}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">{prov.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] italic">
                No active subscription streaming found for {selectedCountry}. Check digital store platforms or JustWatch below.
              </p>
            )}

            {providers?.link && (
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-accent)] hover:underline pt-1"
              >
                View Full Regional Streaming Availability on JustWatch <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Top Cast & Crew Filmography Exploration */}
          {cast.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--surface-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-4 h-4 text-[var(--brand-accent)]" /> Top Cast & Filmography
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)]">Tap actor to view top films</span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {cast.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setFilmographyPerson({ id: member.id, name: member.name })}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-20 text-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--canvas)] border border-[var(--surface-border)] group-hover:border-[var(--brand-accent)] transition shadow">
                      {member.profile_path ? (
                        <img
                          src={getTMDBImageUrl(member.profile_path, "w500")}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--text-secondary)]">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[var(--text-primary)] truncate w-full group-hover:text-[var(--brand-accent)] transition">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate w-full">
                      {member.character}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* YOUR LIBRARY & WATCH STATUS TRACKER */}
          <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider">
                <Bookmark className="w-4 h-4 text-[var(--brand-accent)]" /> Your Library Status
              </h3>
              {currentWatchItem && (
                <button
                  type="button"
                  onClick={() => onSetWatchStatus?.(currentMovie, "NONE")}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from Library
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSetWatchStatus?.(currentMovie, "WANT_TO_WATCH")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border cursor-pointer ${
                  currentWatchItem?.status === "WANT_TO_WATCH"
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-md"
                    : "bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--surface-border)]"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Want to Watch</span>
              </button>

              <button
                type="button"
                onClick={() => onSetWatchStatus?.(currentMovie, "CURRENTLY_WATCHING")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border cursor-pointer ${
                  currentWatchItem?.status === "CURRENTLY_WATCHING"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold"
                    : "bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--surface-border)]"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Watching</span>
              </button>

              <button
                type="button"
                onClick={() => onSetWatchStatus?.(currentMovie, "WATCHED", currentWatchItem?.rating_stars || 5.0)}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border cursor-pointer ${
                  currentWatchItem?.status === "WATCHED"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold"
                    : "bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--surface-border)]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Watched</span>
              </button>
            </div>

            {/* Interactive Rating Row when marked as Watched */}
            {currentWatchItem?.status === "WATCHED" && (
              <div className="pt-2 border-t border-[var(--surface-border)] flex items-center justify-between gap-2 animate-in fade-in">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Your Star Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onSetWatchStatus?.(currentMovie, "WATCHED", star)}
                      className="p-1 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (currentWatchItem?.rating_stars || 5.0) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-[var(--text-muted)]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-amber-400 ml-1.5">
                    {(currentWatchItem?.rating_stars || 5.0).toFixed(1)} ★
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CTA ROW: Primary Recommend CTA and Watch Trailer */}
          <div className="pt-4 border-t border-[var(--surface-border)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={handleRecommendClick}
              className="flex-1 h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-black text-xs px-6 rounded-xl shadow-xl transition flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" /> Recommend This Film to a Friend
            </Button>

            <Button
              onClick={handleTrailer}
              className="h-12 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs px-5 rounded-xl transition flex items-center justify-center gap-1.5 border border-[var(--surface-border)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Trailer
            </Button>
          </div>

        </div>
      </div>

      {/* Cast Filmography Drawer / Modal */}
      {filmographyPerson && (
        <CastFilmographyModal
          isOpen={filmographyPerson !== null}
          onClose={() => setFilmographyPerson(null)}
          personId={filmographyPerson.id}
          personName={filmographyPerson.name}
          onSelectMovie={(newMovie) => {
            setMovie(newMovie);
            setProviders(null);
            setCast([]);
          }}
          onOpenTrailer={onOpenTrailer}
          onToggleWatchlist={onToggleWatchlist}
          watchlist={watchlist}
        />
      )}
    </div>
  );
}
