"use client";

import { useState, useEffect } from "react";
import { Button, IconButton, Badge } from "@usefragments/ui";
import { MovieItem, getTMDBImageUrl, getPersonFilmography, getMovieTrailerKey } from "@/lib/tmdb";
import { X, Play, Plus, Check, Star, Film, Sparkles } from "lucide-react";

interface CastFilmographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number | null;
  personName: string;
  onSelectMovie: (movie: MovieItem) => void;
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
  onToggleWatchlist: (movie: MovieItem) => void;
  watchlist: any[];
}

export function CastFilmographyModal({
  isOpen,
  onClose,
  personId,
  personName,
  onSelectMovie,
  onOpenTrailer,
  onToggleWatchlist,
  watchlist,
}: CastFilmographyModalProps) {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<MovieItem[]>([]);
  const [actorName, setActorName] = useState(personName);

  useEffect(() => {
    if (!isOpen || !personId) return;

    let isMounted = true;
    setLoading(true);
    setActorName(personName);

    getPersonFilmography(personId).then((res) => {
      if (isMounted) {
        setCredits(res.credits);
        if (res.personName && res.personName !== "Actor") {
          setActorName(res.personName);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, personId, personName]);

  if (!isOpen || !personId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">{actorName}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Top-Rated Filmography & Credits</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Filmography Grid */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-[var(--text-muted)] animate-pulse">
              Loading {actorName}'s top films...
            </div>
          ) : credits.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--text-secondary)]">
              No filmography records found for this artist.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {credits.map((item) => {
                const isSaved = watchlist.some((w) => w.tmdb_id === item.id && w.status === "WANT_TO_WATCH");
                const year = (item.release_date || item.first_air_date || "").substring(0, 4);

                return (
                  <div
                    key={item.id}
                    className="bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[var(--brand-accent)] transition shadow"
                  >
                    <div
                      onClick={() => {
                        onClose();
                        onSelectMovie(item);
                      }}
                      className="relative aspect-[2/3] bg-black/40 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={getTMDBImageUrl(item.poster_path, "w500")}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400 flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 fill-current" /> {item.vote_average.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div
                        onClick={() => {
                          onClose();
                          onSelectMovie(item);
                        }}
                        className="cursor-pointer"
                      >
                        <h4 className="font-extrabold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--brand-accent)] transition">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">{year || "Film"}</p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(item);
                          }}
                          className={`w-full h-8 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                            isSaved
                              ? "bg-[var(--brand-accent)]/20 text-[var(--text-primary)] border-[var(--brand-accent)]"
                              : "bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--surface-border)]"
                          }`}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 text-[var(--brand-accent)] stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isSaved ? "In Library" : "+ Library"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
