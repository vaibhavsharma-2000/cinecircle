"use client";

import { useState, useEffect, useRef } from "react";
import { Button, IconButton, Badge } from "@usefragments/ui";
import { WatchlistItem } from "@/lib/supabase";
import { getTMDBImageUrl, getMovieTrailerKey } from "@/lib/tmdb";
import { X, Play, RotateCw, Sparkles, Trophy, Film, PartyPopper, Check } from "lucide-react";

interface WatchRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: WatchlistItem[];
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
}

export function WatchRouletteModal({
  isOpen,
  onClose,
  movies,
  onOpenTrailer,
}: WatchRouletteModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winner, setWinner] = useState<WatchlistItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpin = () => {
    if (movies.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
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
      }
    };

    spinTimerRef.current = setTimeout(step, speed);
  };

  useEffect(() => {
    if (isOpen && movies.length > 0) {
      startSpin();
    } else {
      setWinner(null);
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
                className="absolute rounded-full animate-bounce"
                style={{
                  left: `${left}%`,
                  top: `${Math.random() * 40}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  animationDelay: `${delay}s`,
                  animationDuration: "1.5s",
                  opacity: 0.85,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6 text-center z-20">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Watch Roulette</h3>
              <p className="text-xs text-[var(--text-secondary)]">Decision maker for tonight's film</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Carousel / Spinning Reel Display */}
        <div className="relative flex flex-col items-center justify-center py-2">
          <div
            className={`relative w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
              winner
                ? "border-[var(--star-accent)] scale-105 ring-4 ring-[var(--star-accent)]/20"
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
                  <Trophy className="w-3 h-3 fill-current" /> Tonight's Pick!
                </span>
              ) : null}
            </div>
          </div>

          {/* Movie Details */}
          <div className="mt-4 space-y-1">
            <h4 className="font-black text-lg text-[var(--text-primary)] tracking-tight">
              {currentDisplayMovie?.title}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-bold">
              {currentDisplayMovie?.release_year} • {currentDisplayMovie?.genre || "Movie"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--surface-border)]">
          {winner ? (
            <div className="space-y-2">
              <Button
                onClick={async () => {
                  const key = await getMovieTrailerKey(winner.tmdb_id, winner.media_type);
                  onOpenTrailer(winner.title, key);
                }}
                className="w-full h-11 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Official Trailer
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={startSpin}
                  className="h-10 rounded-xl bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Spin Again 🎲
                </Button>

                <Button
                  onClick={onClose}
                  className="h-10 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" /> Lock It In 🍿
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
