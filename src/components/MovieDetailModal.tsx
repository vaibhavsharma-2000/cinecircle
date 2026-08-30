"use client";

import { useState, useEffect } from "react";
import { Badge, Button, IconButton } from "@usefragments/ui";
import {
  MovieItem,
  getMovieDetails,
  getWatchProviders,
  getMovieTrailerKey,
  getTMDBImageUrl,
  WatchProvidersResult,
} from "@/lib/tmdb";
import { Star, X, Play, Plus, Check, Sparkles, Tv, Clock, Calendar } from "lucide-react";
import { WatchlistItem, supabase } from "@/lib/supabase";
import { subscribeToComments } from "@/lib/sync";

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
  watchlist,
}: MovieDetailModalProps) {
  const [movie, setMovie] = useState<MovieItem | null>(initialMovie || null);
  const [providers, setProviders] = useState<WatchProvidersResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{author: string; text: string}[]>([]);

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
      const details = await getMovieDetails(movieId!, mediaType);
      if (details) setMovie(details);
      const watchData = await getWatchProviders(movieId!, mediaType);
      setProviders(watchData);
      setIsLoading(false);
    }

    loadData();
  }, [isOpen, movieId, mediaType]);

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

  const isSaved = watchlist.some((w) => w.tmdb_id === movieId && w.status === "WANT_TO_WATCH");

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

          {/* Where to Stream / Watch Providers */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--surface-border)]">
            <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
              <Tv className="w-4 h-4 text-[var(--brand-accent)]" /> Where to Stream
            </h3>

            {providers?.flatrate && providers.flatrate.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {providers.flatrate.map((prov) => (
                  <div
                    key={prov.provider_id}
                    className="flex items-center gap-2 bg-[var(--canvas)] p-2.5 rounded-xl border border-[var(--surface-border)]"
                  >
                    <img
                      src={getTMDBImageUrl(prov.logo_path, "w500")}
                      alt={prov.provider_name}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{prov.provider_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] italic">
                Available to stream/rent on digital platforms (Apple TV, Amazon Prime Video, Google Play).
              </p>
            )}
          </div>

          {/* MAIN CTA ROW: Primary Recommend CTA */}
          <div className="pt-4 border-t border-[var(--surface-border)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={handleRecommendClick}
              className="flex-1 h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-black text-xs px-6 rounded-xl shadow-xl transition flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-current" /> Recommend This Film to a Friend
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleTrailer}
                className="h-12 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs px-5 rounded-xl transition flex items-center justify-center gap-1.5 border border-[var(--surface-border)]"
              >
                <Play className="w-4 h-4 fill-current" /> Trailer
              </Button>

              <Button
                onClick={() => onToggleWatchlist(currentMovie)}
                className="h-12 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs px-5 rounded-xl transition flex items-center justify-center gap-1.5 border border-[var(--surface-border)]"
              >
                {isSaved ? <Check className="w-4 h-4 text-[var(--brand-accent)]" /> : <Plus className="w-4 h-4" />}
                {isSaved ? "Saved" : "Watchlist"}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
