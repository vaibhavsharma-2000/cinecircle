"use client";

import { useState, useEffect } from "react";
import { Card, Badge, Button, IconButton, EmptyState } from "@usefragments/ui";
import { WatchlistItem, FriendItem } from "@/lib/supabase";
import { MovieItem, getTMDBImageUrl } from "@/lib/tmdb";
import { fetchFriendWatchlist } from "@/lib/sync";
import { UserAvatar } from "./UserAvatar";
import { X, Bookmark, Eye, CheckCircle2, Star, Plus, Check, Loader2 } from "lucide-react";

interface FriendLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem | null;
  myWatchlist: WatchlistItem[];
  onToggleMyWatchlist: (movie: MovieItem) => void;
  onOpenMovieDetail?: (movie: MovieItem) => void;
}

export function FriendLibraryModal({
  isOpen,
  onClose,
  friend,
  myWatchlist,
  onToggleMyWatchlist,
  onOpenMovieDetail,
}: FriendLibraryModalProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "WANT_TO_WATCH" | "CURRENTLY_WATCHING" | "WATCHED">("ALL");

  useEffect(() => {
    if (!isOpen || !friend) return;
    setIsLoading(true);
    fetchFriendWatchlist(friend.id).then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, [isOpen, friend]);

  if (!isOpen || !friend) return null;

  const wantCount = items.filter((w) => w.status === "WANT_TO_WATCH").length;
  const watchingCount = items.filter((w) => w.status === "CURRENTLY_WATCHING").length;
  const watchedCount = items.filter((w) => w.status === "WATCHED").length;

  const filteredItems = items.filter((item) => {
    if (filter === "WANT_TO_WATCH") return item.status === "WANT_TO_WATCH";
    if (filter === "CURRENTLY_WATCHING") return item.status === "CURRENTLY_WATCHING";
    if (filter === "WATCHED") return item.status === "WATCHED";
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col cursor-default"
      >
        
        {/* Header Bar */}
        <div className="p-6 border-b border-[var(--surface-border)] flex items-center justify-between gap-4 bg-[var(--canvas)]/40">
          <div className="flex items-center gap-3.5">
            <UserAvatar avatarId={friend.avatar_character_id} displayName={friend.display_name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[var(--text-primary)]">{friend.display_name}&apos;s Library</h2>
                <Badge className="bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[var(--brand-accent)]/30">
                  @{friend.username}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Browse movie picks, series in progress, and rated favourites
              </p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Subtab Filter Bar */}
        <div className="px-6 py-3 border-b border-[var(--surface-border)] flex items-center gap-2 overflow-x-auto bg-[var(--canvas)]/20">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`h-8 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "ALL"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Titles ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("WANT_TO_WATCH")}
            className={`h-8 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "WANT_TO_WATCH"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Want to Watch ({wantCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("CURRENTLY_WATCHING")}
            className={`h-8 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "CURRENTLY_WATCHING"
                ? "bg-amber-500 text-slate-950 font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Watching ({watchingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("WATCHED")}
            className={`h-8 px-3.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === "WATCHED"
                ? "bg-emerald-600 text-white font-extrabold shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Watched ({watchedCount})
          </button>
        </div>

        {/* Library Content Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-accent)]" />
              <p className="text-xs font-bold">Loading {friend.display_name}&apos;s library...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState className="py-16 text-center bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-2 max-w-sm mx-auto">
              <p className="text-sm font-extrabold text-[var(--text-primary)]">No titles in this category</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {friend.display_name} hasn&apos;t added any titles to this section yet.
              </p>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const movieObj: MovieItem = {
                  id: item.tmdb_id,
                  title: item.title,
                  poster_path: item.poster_path,
                  backdrop_path: null,
                  media_type: item.media_type,
                  release_date: item.release_year,
                  vote_average: item.rating_stars || 8.0,
                  vote_count: 100,
                  overview: "",
                };
                const isInMyLibrary = myWatchlist.some((w) => w.tmdb_id === item.tmdb_id);

                return (
                  <Card
                    key={item.id}
                    onClick={() => onOpenMovieDetail?.(movieObj)}
                    className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow flex flex-col justify-between cursor-pointer"
                  >
                    {/* Poster Artwork */}
                    <div className="relative aspect-[2/3] bg-black/60 overflow-hidden">
                      <img
                        src={getTMDBImageUrl(item.poster_path, "w500")}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-90" />

                      {/* Status Badge */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        {item.status === "CURRENTLY_WATCHING" ? (
                          <Badge className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow">
                            <Eye className="w-2.5 h-2.5 inline mr-1" /> Watching
                          </Badge>
                        ) : item.status === "WATCHED" ? (
                          <Badge className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow">
                            <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Watched
                          </Badge>
                        ) : (
                          <Badge className="bg-[var(--brand-accent)] text-[var(--brand-accent-text)] px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider shadow">
                            <Bookmark className="w-2.5 h-2.5 inline mr-1" /> Queued
                          </Badge>
                        )}
                      </div>

                      {/* Star Rating Badge if rated */}
                      {item.rating_stars && item.status === "WATCHED" && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <Badge className="bg-black/80 text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-full border border-white/10 shadow flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating_stars.toFixed(1)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Action */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--brand-accent)] transition">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          {item.release_year || "Film"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMyWatchlist(movieObj);
                        }}
                        className={`w-full h-8 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isInMyLibrary
                            ? "bg-[var(--brand-accent)]/20 text-[var(--text-primary)] border-[var(--brand-accent)]"
                            : "bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--surface-border)]"
                        }`}
                      >
                        {isInMyLibrary ? (
                          <>
                            <Check className="w-3 h-3 text-[var(--brand-accent)] stroke-[3]" />
                            <span>In Your Library</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add to My Library</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
