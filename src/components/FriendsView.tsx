import { useState } from "react";
import { Card, Button, IconButton, Avatar, Badge } from "@usefragments/ui";
import { FriendItem, WatchlistItem, Recommendation } from "@/lib/supabase";
import { Users, UserPlus, Trash2, Share2, Flame, Trophy, Sparkles } from "lucide-react";
import { TasteCompatibilityModal } from "./TasteCompatibilityModal";

import { UserAvatar } from "./UserAvatar";

interface FriendsViewProps {
  friends: FriendItem[];
  watchlist?: WatchlistItem[];
  friendRecommendations?: Recommendation[];
  currentUserDisplayName?: string;
  onAddFriend: (username: string) => void;
  onRemoveFriend: (id: string) => void;
  onOpenInvite?: () => void;
  onOpenRecommend?: (title: string) => void;
}

export function FriendsView({
  friends,
  watchlist = [],
  friendRecommendations = [],
  currentUserDisplayName = "You",
  onAddFriend,
  onRemoveFriend,
  onOpenInvite,
  onOpenRecommend,
}: FriendsViewProps) {
  const [newUsername, setNewUsername] = useState("");
  const [comparingFriend, setComparingFriend] = useState<FriendItem | null>(null);

  const extractValue = (val: any): string => {
    if (typeof val === "string") return val;
    if (val && val.target && typeof val.target.value === "string") return val.target.value;
    return "";
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    onAddFriend(newUsername.trim());
    setNewUsername("");
  };

  // Hall of Fame superlatives calculation
  const topCritic =
    friends.length > 0
      ? [...friends].sort((a, b) => b.stats.recommendedCount - a.stats.recommendedCount)[0]
      : null;

  const topCinephile =
    friends.length > 0
      ? [...friends].sort((a, b) => b.stats.watchedCount - a.stats.watchedCount)[0]
      : null;

  const topGenreFriend =
    friends.length > 0
      ? [...friends].sort(
          (a, b) =>
            b.stats.recommendedCount +
            b.stats.watchedCount -
            (a.stats.recommendedCount + a.stats.watchedCount)
        )[0]
      : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[var(--text-primary)]" /> Inner Circle Friends
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your private circle to exchange high-trust film and series reviews
          </p>
        </div>

        {/* Action Buttons: Add Friend + Invite Link */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {onOpenInvite && (
            <Button
              type="button"
              onClick={onOpenInvite}
              className="h-10 px-4 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Share2 className="w-4 h-4 text-[var(--brand-accent)]" /> Invite Friends
            </Button>
          )}

          <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Add @username..."
              className="h-10 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition w-full sm:w-48 flex items-center leading-tight"
            />
            <Button
              type="submit"
              className="h-10 px-4 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Add
            </Button>
          </form>
        </div>
      </div>

      {/* Circle Hall of Fame Superlatives */}
      {friends.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Circle Hall of Fame & Superlatives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCritic && (
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black shrink-0 text-lg">
                  🏆
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Top Critic</span>
                  <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{topCritic.display_name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{topCritic.stats.recommendedCount} Picks Shared</p>
                </div>
              </div>
            )}

            {topCinephile && (
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black shrink-0 text-lg">
                  🍿
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Popcorn Champ</span>
                  <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{topCinephile.display_name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{topCinephile.stats.watchedCount} Films Logged</p>
                </div>
              </div>
            )}

            {topGenreFriend && (
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black shrink-0 text-lg">
                  🎯
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">Genre Guru</span>
                  <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">{topGenreFriend.display_name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{topGenreFriend.stats.topGenre} Expert</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Friends Hero Card */}
      {onOpenInvite && (
        <div className="p-4 sm:p-5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)] text-[var(--brand-accent)] flex items-center justify-center font-black shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--text-primary)]">Invite your friend circle to CineCircle</h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Send a 1-click invite via WhatsApp or iMessage. When friends join, they are automatically added to your circle.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onOpenInvite}
            className="h-9 px-4 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Invite Link
          </Button>
        </div>
      )}

      {/* Friends Card Grid with Taste Match Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend, idx) => {
          const matchPercent = 82 + ((friend.stats.recommendedCount * 4 + idx * 3) % 16);

          return (
            <Card
              key={friend.id}
              className="p-6 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarId={friend.avatar_character_id || (friend as any).avatar_id || "tony_stark"}
                    displayName={friend.display_name}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-[var(--text-primary)]">{friend.display_name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">@{friend.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-black text-emerald-400 flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-current" /> {matchPercent}%
                  </span>

                  <IconButton
                    onClick={() => onRemoveFriend(friend.id)}
                    className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-red-950/60 border border-[var(--surface-border)] hover:border-red-500/30 text-[var(--text-muted)] hover:text-red-400 transition flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              </div>

              {/* Friend Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--surface-border)] text-center">
                <div className="p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)]">
                  <span className="block text-xs font-black text-[var(--text-primary)]">{friend.stats.recommendedCount}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold">Picks</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)]">
                  <span className="block text-xs font-black text-[var(--text-primary)]">{friend.stats.watchedCount}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold">Watched</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)]">
                  <span className="block text-xs font-black text-[var(--text-primary)] truncate">{friend.stats.topGenre}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold">Favorite</span>
                </div>
              </div>

              {/* Compare Taste CTA */}
              <Button
                type="button"
                onClick={() => setComparingFriend(friend)}
                className="w-full h-9 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] hover:border-[var(--brand-accent)] text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Compare Taste Profile
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Taste Compatibility Modal */}
      {comparingFriend && (
        <TasteCompatibilityModal
          isOpen={comparingFriend !== null}
          onClose={() => setComparingFriend(null)}
          friend={comparingFriend}
          currentUserDisplayName={currentUserDisplayName}
          watchlist={watchlist}
          friendRecommendations={friendRecommendations}
          onOpenRecommend={(title) => {
            if (onOpenRecommend) onOpenRecommend(title);
          }}
        />
      )}
    </div>
  );
}
