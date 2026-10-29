"use client";

import { useState } from "react";
import { Card, Button, Badge, EmptyState } from "@usefragments/ui";
import { FriendItem, WatchlistItem } from "@/lib/supabase";
import { getTMDBImageUrl, MovieItem } from "@/lib/tmdb";
import { fetchFriendWatchlist } from "@/lib/sync";
import { Sparkles, Users, Flame, Dices, Bookmark, Check, Loader2, Star } from "lucide-react";
import { WatchRouletteModal } from "./WatchRouletteModal";
import { UserAvatar } from "./UserAvatar";

export interface GroupMatchItem {
  item: WatchlistItem;
  consensusCount: number;
  totalMembers: number;
  matchPercentage: number;
  matchedFriends: { id: string; username: string; display_name: string; avatarId: string }[];
  isUserWatchlist: boolean;
}

interface GroupMatcherViewProps {
  friends: FriendItem[];
  watchlist: WatchlistItem[];
  onOpenTrailer: (title: string, youtubeKey: string | null) => void;
  onOpenMovieDetail?: (movie: MovieItem) => void;
  onOpenRecommend?: (movie: MovieItem) => void;
  onToggleWatchlist?: (movie: MovieItem) => void;
}

export function GroupMatcherView({
  friends,
  watchlist,
  onOpenTrailer,
  onOpenMovieDetail,
  onOpenRecommend,
  onToggleWatchlist,
}: GroupMatcherViewProps) {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<GroupMatchItem[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFriendIds.length === friends.length) {
      setSelectedFriendIds([]);
    } else {
      setSelectedFriendIds(friends.map((f) => f.id));
    }
  };

  const handleCalculateMatch = async () => {
    if (selectedFriendIds.length === 0) {
      // If no friends selected, show user's own watchlist
      const userWants = watchlist.filter((w) => w.status === "WANT_TO_WATCH");
      const userMatches: GroupMatchItem[] = userWants.map((w) => ({
        item: w,
        consensusCount: 1,
        totalMembers: 1,
        matchPercentage: 100,
        matchedFriends: [],
        isUserWatchlist: true,
      }));
      setMatches(userMatches);
      return;
    }

    setIsCalculating(true);

    try {
      // 1. Fetch all selected friends' watchlists concurrently
      const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.id));
      const friendsWatchlists = await Promise.all(
        selectedFriends.map(async (friend) => {
          const list = await fetchFriendWatchlist(friend.id);
          return {
            friend,
            watchlist: list.filter((item) => item.status === "WANT_TO_WATCH"),
          };
        })
      );

      const userWantList = watchlist.filter((item) => item.status === "WANT_TO_WATCH");
      const totalMembers = selectedFriends.length + 1; // User + selected friends

      // 2. Map of tmdb_id -> { item, userHas: boolean, matchedFriends: friend[] }
      const movieAgreementMap = new Map<
        number,
        {
          item: WatchlistItem;
          userHas: boolean;
          friends: { id: string; username: string; display_name: string; avatarId: string }[];
        }
      >();

      // Record user's watchlist titles
      for (const w of userWantList) {
        movieAgreementMap.set(w.tmdb_id, {
          item: w,
          userHas: true,
          friends: [],
        });
      }

      // Record selected friends' watchlist titles
      for (const { friend, watchlist: fList } of friendsWatchlists) {
        for (const item of fList) {
          const existing = movieAgreementMap.get(item.tmdb_id);
          const friendMeta = {
            id: friend.id,
            username: friend.username,
            display_name: friend.display_name,
            avatarId: friend.avatar_character_id,
          };

          if (existing) {
            existing.friends.push(friendMeta);
          } else {
            movieAgreementMap.set(item.tmdb_id, {
              item,
              userHas: false,
              friends: [friendMeta],
            });
          }
        }
      }

      // 3. Filter for mutual matches:
      // Priority A: Films on user's list AND at least one friend's list
      // Priority B: Films agreed upon by 2 or more selected friends
      const calculatedMatches: GroupMatchItem[] = [];

      for (const [, entry] of movieAgreementMap.entries()) {
        const consensusCount = (entry.userHas ? 1 : 0) + entry.friends.length;

        // Keep items if either:
        // - User has it and at least one friend has it (mutual match)
        // - Multiple friends want it (2+)
        if ((entry.userHas && entry.friends.length > 0) || entry.friends.length >= 2) {
          calculatedMatches.push({
            item: entry.item,
            consensusCount,
            totalMembers,
            matchPercentage: Math.round((consensusCount / totalMembers) * 100),
            matchedFriends: entry.friends,
            isUserWatchlist: entry.userHas,
          });
        }
      }

      // Sort by consensus count descending (highest group agreement first)
      calculatedMatches.sort((a, b) => b.consensusCount - a.consensusCount);

      setMatches(calculatedMatches);
    } catch (err) {
      console.error("Error calculating group match:", err);
      // Fallback to user's list if error
      const userWants = watchlist.filter((w) => w.status === "WANT_TO_WATCH");
      setMatches(
        userWants.map((w) => ({
          item: w,
          consensusCount: 1,
          totalMembers: 1,
          matchPercentage: 100,
          matchedFriends: [],
          isUserWatchlist: true,
        }))
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const rouletteMovies =
    matches && matches.length > 0
      ? matches.map((m) => m.item)
      : watchlist.filter((w) => w.status === "WANT_TO_WATCH");

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-[var(--surface-border)] pb-6 space-y-1">
        <h1 className="font-display text-4xl sm:text-5xl text-[var(--text-primary)] flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-[var(--text-primary)]" /> Movie Night Group Matcher
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          "What should we watch tonight?" Select circle friends to instantly calculate mutual watchlist consensus!
        </p>
      </div>

      {/* Step 1: Select Watching Friends */}
      <Card className="p-6 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--text-primary)]" /> 1. Who is watching tonight?
          </h2>
          <div className="flex items-center gap-2">
            {friends.length > 1 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition cursor-pointer"
              >
                {selectedFriendIds.length === friends.length ? "Deselect All" : "Select All"}
              </button>
            )}
            <Badge className="text-xs text-[var(--text-primary)] font-extrabold bg-[var(--canvas)] px-3.5 py-1 rounded-full border border-[var(--surface-border)]">
              {selectedFriendIds.length} Selected
            </Badge>
          </div>
        </div>

        {friends.length === 0 ? (
          <div className="p-6 text-center bg-[var(--canvas)] rounded-2xl border border-[var(--surface-border)] text-xs text-[var(--text-secondary)]">
            No friends in your inner circle yet. Add friends or send invite links to unlock group watchlist matching!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {friends.map((friend) => {
              const isSelected = selectedFriendIds.includes(friend.id);
              return (
                <Button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`p-3.5 h-auto rounded-2xl border flex items-center gap-3 transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-md"
                      : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <UserAvatar
                    avatarId={friend.avatar_character_id || (friend as any).avatar_id}
                    displayName={friend.display_name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs block truncate">{friend.display_name}</span>
                    <span
                      className={`text-[10px] font-medium block truncate ${
                        isSelected ? "opacity-80" : "text-[var(--text-muted)]"
                      }`}
                    >
                      @{friend.username}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleCalculateMatch}
            disabled={isCalculating}
            className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing Watchlists...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Calculate Group Matches</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              if (!matches || matches.length === 0) {
                handleCalculateMatch();
              }
              setIsRouletteOpen(true);
            }}
            className="w-full h-12 bg-[var(--surface-sunken)] hover:opacity-90 border border-[var(--brand-accent)]/30 text-[var(--brand-accent)] font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4" /> Spin Watch Roulette 🎰
          </Button>
        </div>
      </Card>

      {/* Step 2: Match Results */}
      {matches && (
        <section className="space-y-6 pt-4 border-t border-[var(--surface-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[var(--star-accent)]" /> Mutual Group Consensus ({matches.length})
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {selectedFriendIds.length === 0
                  ? "Showing your personal want-to-watch queue"
                  : `Ranked by mutual agreement between you and ${selectedFriendIds.length} friend${
                      selectedFriendIds.length > 1 ? "s" : ""
                    }`}
              </p>
            </div>

            {matches.length > 0 && (
              <Button
                onClick={() => setIsRouletteOpen(true)}
                className="h-9 px-4 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
              >
                <Dices className="w-3.5 h-3.5" /> Roulette Pick
              </Button>
            )}
          </div>

          {matches.length === 0 ? (
            <EmptyState className="py-14 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-sunken)] text-[var(--brand-accent)] flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-sm">No exact title overlap found</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                None of your selected friends currently share the exact same titles queued in their watchlist. Try adding more films or spin Watch Roulette!
              </p>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {matches.map((matchItem) => {
                const item = matchItem.item;
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
                const isSaved = watchlist.some((w) => w.tmdb_id === item.tmdb_id);
                const isUnanimous = matchItem.consensusCount === matchItem.totalMembers && matchItem.totalMembers > 1;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--surface-border)] group hover:border-[var(--brand-accent)] transition duration-300 shadow-xl flex flex-col justify-between"
                  >
                    {/* Clickable Poster */}
                    <div
                      onClick={() => onOpenMovieDetail?.(movieObj)}
                      className="relative aspect-[2/3] bg-black/60 overflow-hidden cursor-pointer group/poster"
                    >
                      <img
                        src={getTMDBImageUrl(item.poster_path, "w500")}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/poster:scale-105 transition duration-500"
                      />

                      {/* Consensus Badge Top Left */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {isUnanimous ? (
                          <div className="px-3 py-1 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-[10px] uppercase shadow-lg flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3 fill-current" /> 100% Group Pick
                          </div>
                        ) : matchItem.consensusCount > 1 ? (
                          <div className="px-2.5 py-1 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-[10px] uppercase shadow-md flex items-center gap-1">
                            <span>{matchItem.consensusCount} Mutual Wants</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[var(--text-secondary)] font-bold text-[10px] border border-white/10">
                            In Your Queue
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-85" />
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenMovieDetail?.(movieObj)}
                          className="font-extrabold text-sm text-[var(--text-primary)] hover:text-[var(--brand-accent)] hover:underline text-left transition cursor-pointer block truncate w-full"
                        >
                          {item.title}
                        </button>
                        <p className="text-[11px] text-[var(--text-secondary)]">{item.release_year}</p>

                        {/* Who else in the group wants to watch this */}
                        {matchItem.matchedFriends.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">Wanted by:</span>
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {matchItem.matchedFriends.map((f) => (
                                <div key={f.id} title={`@${f.username}`}>
                                  <UserAvatar avatarId={f.avatarId} displayName={f.display_name} size="xs" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate">
                              {matchItem.matchedFriends.map((f) => f.display_name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[var(--surface-border)]">
                        {onOpenRecommend && (
                          <Button
                            type="button"
                            onClick={() => onOpenRecommend(movieObj)}
                            className="flex-1 h-9 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" /> Recommend
                          </Button>
                        )}
                        {onToggleWatchlist && (
                          <Button
                            type="button"
                            onClick={() => onToggleWatchlist(movieObj)}
                            title={isSaved ? "Saved in Library" : "Add to Library"}
                            className={`w-9 h-9 rounded-xl text-xs font-bold border transition flex items-center justify-center p-0 cursor-pointer ${
                              isSaved
                                ? "bg-[var(--brand-accent)]/20 border-[var(--brand-accent)] text-[var(--text-primary)]"
                                : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {isSaved ? (
                              <Check className="w-3.5 h-3.5 text-[var(--brand-accent)] stroke-[3]" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Watch Roulette Modal */}
      <WatchRouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        movies={rouletteMovies}
        onOpenTrailer={onOpenTrailer}
        onOpenMovieDetail={onOpenMovieDetail}
        onOpenRecommend={onOpenRecommend}
      />
    </div>
  );
}
