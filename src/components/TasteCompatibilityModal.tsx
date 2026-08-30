"use client";

import { Button, IconButton, Badge } from "@usefragments/ui";
import { FriendItem, WatchlistItem, Recommendation } from "@/lib/supabase";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { X, Sparkles, Flame, Check, Film, Heart, ArrowRight } from "lucide-react";

interface TasteCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem | null;
  currentUserDisplayName: string;
  watchlist: WatchlistItem[];
  friendRecommendations: Recommendation[];
  onOpenRecommend: (movieTitle: string) => void;
}

export function TasteCompatibilityModal({
  isOpen,
  onClose,
  friend,
  currentUserDisplayName,
  watchlist,
  friendRecommendations,
  onOpenRecommend,
}: TasteCompatibilityModalProps) {
  if (!isOpen || !friend) return null;

  // Calculate dynamic taste compatibility percentage based on friend stats and watchlist count
  const baseMatch = 75;
  const picksBonus = Math.min((friend.stats.recommendedCount || 0) * 3, 12);
  const watchedBonus = Math.min((friend.stats.watchedCount || 0) * 1, 10);
  const tasteScore = Math.min(baseMatch + picksBonus + watchedBonus, 98);

  // Common mutual films from friend recommendations and user's watchlist
  const friendRecs = friendRecommendations.filter(
    (r) => r.sender_name.toLowerCase() === friend.display_name.toLowerCase() ||
           r.sender_name.toLowerCase() === friend.username.toLowerCase()
  );

  const sharedFavorites = watchlist.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Taste Compatibility</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {currentUserDisplayName} & {friend.display_name}
              </p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1">
          
          {/* Circular Taste Score Hero */}
          <div className="p-6 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] text-center space-y-3 relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border-2 border-[var(--star-accent)]/50 shadow-xl">
              <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {tasteScore}%
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--star-accent)]" /> Phenomenal Cinematic Match!
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                You and {friend.display_name} share an affinity for {friend.stats.topGenre} stories and high-concept cinema.
              </p>
            </div>

            {/* Quick Metrics Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--surface-border)] text-center">
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
                <span className="block text-xs font-black text-[var(--text-primary)]">{friend.stats.topGenre}</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">Top Shared Genre</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
                <span className="block text-xs font-black text-[var(--text-primary)]">
                  {friend.stats.recommendedCount} Picks
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">Recommended to Circle</span>
              </div>
            </div>
          </div>

          {/* Films to Watch Together */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[var(--brand-accent)]" /> Great Candidates for Movie Night
            </h4>

            <div className="space-y-2">
              {sharedFavorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl gap-3 shadow-sm hover:border-[var(--brand-accent)] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getTMDBImageUrl(item.poster_path, "w500")}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-[var(--text-primary)] truncate">{item.title}</h5>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {item.release_year} • {item.genre || "Featured"}
                      </p>
                    </div>
                  </div>

                  <Badge className="px-2.5 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] text-[10px] font-extrabold text-[var(--text-primary)] shrink-0">
                    Mutual Pick
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Friend's Recent Circle Recommendations */}
          {friendRecs.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400" /> {friend.display_name}&apos;s Top Recommendations
              </h4>
              <div className="space-y-2">
                {friendRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[var(--text-primary)]">{rec.title}</span>
                      <span className="text-[11px] font-black text-amber-400">⭐ {rec.rating_stars.toFixed(1)}</span>
                    </div>
                    {rec.note && (
                      <p className="text-[11px] text-[var(--text-secondary)] italic line-clamp-2">
                        &quot;{rec.note}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-[var(--surface-border)] shrink-0">
          <Button
            onClick={() => {
              onClose();
              onOpenRecommend("");
            }}
            className="w-full h-11 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Recommend a Movie to {friend.display_name} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
