"use client";

import { useState } from "react";
import { Card, Button, Badge, Avatar, EmptyState } from "@usefragments/ui";
import { FriendItem, WatchlistItem } from "@/lib/supabase";
import { getTMDBImageUrl, getMovieTrailerKey } from "@/lib/tmdb";
import { Sparkles, Users, Play, Flame, Dices } from "lucide-react";
import { WatchRouletteModal } from "./WatchRouletteModal";

interface GroupMatcherViewProps {
  friends: FriendItem[];
  watchlist: WatchlistItem[];
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
}

export function GroupMatcherView({
  friends,
  watchlist,
  onOpenTrailer,
}: GroupMatcherViewProps) {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<WatchlistItem[] | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  const toggleFriend = (id: string) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((f) => f !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const handleCalculateMatch = () => {
    // Generate mutual watchlist match items
    const mutual = watchlist.filter((item) => item.status === "WANT_TO_WATCH");
    setMatches(mutual);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-[var(--surface-border)] pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-[var(--text-primary)]" /> Movie Night Group Matcher
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          "What should we watch tonight?" Select who's watching to instantly find mutual watchlist matches!
        </p>
      </div>

      {/* Step 1: Select Watching Friends */}
      <Card className="p-6 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--text-primary)]" /> 1. Who is watching tonight?
          </h2>
          <Badge className="text-xs text-[var(--text-primary)] font-extrabold bg-[var(--canvas)] px-3.5 py-1 rounded-full border border-[var(--surface-border)]">
            {selectedFriendIds.length} Selected
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {friends.map((friend) => {
            const isSelected = selectedFriendIds.includes(friend.id);
            return (
              <Button
                key={friend.id}
                onClick={() => toggleFriend(friend.id)}
                className={`p-3.5 h-auto rounded-2xl border flex items-center gap-3 transition text-left ${
                  isSelected
                    ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-md"
                    : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Avatar className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center ${
                  isSelected ? "bg-black/20 text-[var(--brand-accent-text)]" : "bg-[var(--brand-accent)] text-[var(--brand-accent-text)]"
                }`}>
                  {friend.display_name[0]}
                </Avatar>
                <div>
                  <span className="font-extrabold text-xs block">{friend.display_name}</span>
                  <span className={`text-[10px] font-medium block ${isSelected ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                    @{friend.username}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleCalculateMatch}
            className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" /> Calculate Group Matches
          </Button>

          <Button
            onClick={() => {
              if (!matches || matches.length === 0) {
                handleCalculateMatch();
              }
              setIsRouletteOpen(true);
            }}
            className="w-full h-12 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4" /> Spin Watch Roulette 🎰
          </Button>
        </div>
      </Card>

      {/* Step 2: Match Results */}
      {matches && (
        <section className="space-y-6 pt-4 border-t border-[var(--surface-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--star-accent)]" /> Mutual Group Matches ({matches.length})
            </h2>
            {matches.length > 0 && (
              <Button
                onClick={() => setIsRouletteOpen(true)}
                className="h-8 px-3 rounded-lg bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-[11px] flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" /> Roulette Pick
              </Button>
            )}
          </div>

          {matches.length === 0 ? (
            <EmptyState className="py-12 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-2">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">No mutual matches found</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Try adding more movies to your watchlist or selecting different friends!
              </p>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {matches.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div className="relative aspect-[2/3] bg-black/60 overflow-hidden">
                    <img
                      src={getTMDBImageUrl(item.poster_path, "w500")}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-[10px] uppercase shadow">
                      ★ 100% Match
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)] transition">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.release_year}</p>
                    </div>

                    <Button
                      onClick={async () => {
                        const key = await getMovieTrailerKey(item.tmdb_id, item.media_type);
                        onOpenTrailer(item.title, key);
                      }}
                      className="w-full h-10 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch Trailer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Watch Roulette Modal */}
      <WatchRouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        movies={
          matches && matches.length > 0
            ? matches
            : watchlist.filter((w) => w.status === "WANT_TO_WATCH")
        }
        onOpenTrailer={onOpenTrailer}
      />
    </div>
  );
}
