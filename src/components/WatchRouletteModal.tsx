"use client";

import { useState, useEffect, useRef } from "react";
import { Button, IconButton, Badge } from "@usefragments/ui";
import { WatchlistItem } from "@/lib/supabase";
import { getTMDBImageUrl, getMovieTrailerKey, getMovieDetails, MovieItem } from "@/lib/tmdb";
import { X, Play, RotateCw, Sparkles, Trophy, Film, PartyPopper, Check, ExternalLink } from "lucide-react";

interface WatchRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: WatchlistItem[];
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
  onOpenMovieDetail?: (movie: MovieItem) => void;
  onOpenRecommend?: (movie: MovieItem) => void;
}

export function WatchRouletteModal({
  isOpen,
  onClose,
  movies,
  onOpenTrailer,
  onOpenMovieDetail,
  onOpenRecommend,
}: WatchRouletteModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winner, setWinner] = useState<WatchlistItem | null>(null);
  const [winnerOverview, setWinnerOverview] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpin = () => {
    if (movies.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setWinnerOverview("");
    setShowConfetti(false);

    let speed = 60; // initial speed in ms
    let elapsed = 0;
    const totalDuration = 3500; // spin duration 3.5s
    let tempIndex = Math.floor(Math.random() * movies.length);

    const step = () => {
      tempIndex = (tempIndex + 1) % movies.length;
      setCurrentIndex(tempIndex);
      elapsed += speed;

      // Quadratic easing: slow down gradually
      if (elapsed > totalDuration * 0.5) {
        speed += 25;
      }
      if (elapsed > totalDuration * 0.8) {
        speed += 60;
      }

      if (elapsed < totalDuration) {
        spinTimerRef.current = setTimeout(step, speed);
      } else {
        // Spin finished!
        const winningMovie = movies[tempIndex];
        setWinner(winningMovie);
        setIsSpinning(false);
        setShowConfetti(true);

        // Fetch winning movie overview/synopsis
        getMovieDetails(winningMovie.tmdb_id, winningMovie.media_type)
          .then((details) => {
            if (details?.overview) {
              setWinnerOverview(details.overview);
            }
          })
          .catch(() => {});
      }
    };

    spinTimerRef.current = setTimeout(step, speed);
  };

  useEffect(() => {
    if (isOpen && movies.length > 0) {
      startSpin();
    } else {
      setWinner(null);
      setWinnerOverview("");
      setShowConfetti(false);
      setIsSpinning(false);
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    }

    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, [isOpen]);

  if (!isOpen || movies.length === 0) return null;

  const currentDisplayMovie = winner || movies[currentIndex];

  const toMovieItem = (item: WatchlistItem, overview: string = ""): MovieItem => ({
    id: item.tmdb_id,
    title: item.title,
    poster_path: item.poster_path,
    backdrop_path: null,
    media_type: item.media_type,
    release_date: item.release_year,
    vote_average: item.rating_stars || 8.0,
    vote_count: 100,
    overview: overview,
  });

  const handleOpenWinnerDetail = () => {
    if (winner && onOpenMovieDetail) {
      onClose();
      onOpenMovieDetail(toMovieItem(winner, winnerOverview));
    }
  };

  const handleRecommendWinner = () => {
    if (winner && onOpenRecommend) {
      onClose();
      onOpenRecommend(toMovieItem(winner, winnerOverview));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* Decorative Celebration Confetti Particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {Array.from({ length: 32 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const size = 6 + Math.random() * 8;
            const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#ffffff"];
            const color = colors[i % colors.length];
            return (
              <div
                key={i}
                className="absolute top-0 rounded-full opacity-90 animate-bounce"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-5 text-center overflow-hidden z-20 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xl">🎲</span>
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-base tracking-tight">
                Watch Roulette
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isSpinning ? "Randomizing group watchlist..." : "The film reel has stopped!"}
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--surface-border)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Carousel / Spinning Reel Display */}
        <div className="relative flex flex-col items-center justify-center py-1 overflow-y-auto">
          <div
            onClick={handleOpenWinnerDetail}
            className={`relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
              winner
                ? "border-[var(--star-accent)] scale-105 ring-4 ring-[var(--star-accent)]/20 cursor-pointer group"
                : isSpinning
                ? "border-[var(--brand-accent)] animate-pulse"
                : "border-[var(--surface-border)]"
            }`}
          >
            <img
              src={getTMDBImageUrl(currentDisplayMovie?.poster_path, "w500")}
              alt={currentDisplayMovie?.title}
              className="w-full h-full object-cover"
            />

            {/* Reel Status Badge */}
            <div className="absolute top-2 left-2 right-2 flex justify-center">
              {isSpinning ? (
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1.5 shadow">
                  <RotateCw className="w-3 h-3 animate-spin" /> Shuffling...
                </span>
              ) : winner ? (
                <span className="px-3 py-1 rounded-full bg-[var(--star-accent)] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-lg">
                  <Trophy className="w-3 h-3 fill-current" /> Tonight&apos;s Pick!
                </span>
              ) : null}
            </div>

            {winner && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--brand-accent)] text-[var(--brand-accent-text)] text-[10px] font-extrabold shadow">
                  Click for Full Details
                </span>
              </div>
            )}
          </div>

          {/* Movie Details */}
          <div className="mt-3 space-y-1 w-full text-center">
            <button
              type="button"
              onClick={handleOpenWinnerDetail}
              className={`font-black text-lg text-[var(--text-primary)] tracking-tight hover:text-[var(--brand-accent)] transition block mx-auto truncate max-w-full ${
                winner ? "cursor-pointer hover:underline" : ""
              }`}
            >
              {currentDisplayMovie?.title}
            </button>
            <p className="text-xs text-[var(--text-secondary)] font-bold">
              {currentDisplayMovie?.release_year} • {currentDisplayMovie?.media_type === "tv" ? "TV Series" : "Movie"}
            </p>

            {/* Synopsis for Winner */}
            {winner && (
              <div className="mt-2 p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-xl text-left animate-in fade-in duration-200">
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 italic leading-relaxed">
                  {winnerOverview || "Fetching film synopsis from TMDB..."}
                </p>
                {onOpenMovieDetail && (
                  <button
                    type="button"
                    onClick={handleOpenWinnerDetail}
                    className="text-[10px] font-extrabold text-[var(--brand-accent)] hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
                  >
                    View Full Synopsis & Cast <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-[var(--surface-border)]">
          {winner ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={async () => {
                    const key = await getMovieTrailerKey(winner.tmdb_id, winner.media_type);
                    onOpenTrailer(winner.title, key);
                  }}
                  className="h-10 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Trailer 🎬
                </Button>

                {onOpenRecommend && (
                  <Button
                    onClick={handleRecommendWinner}
                    className="h-10 rounded-xl bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Recommend ✨
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={startSpin}
                  className="h-9 rounded-xl bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" /> Spin Again 🎲
                </Button>

                <Button
                  onClick={onClose}
                  className="h-9 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Lock It In 🍿
                </Button>
              </div>
            </div>
          ) : (
            <Button
              disabled={isSpinning}
              className="w-full h-11 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)] text-[var(--text-muted)] font-extrabold text-xs flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4 animate-spin" /> Selecting from {movies.length} matched films...
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
