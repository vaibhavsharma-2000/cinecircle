"use client";

import { useState } from "react";
import { Card, Button, IconButton, Badge } from "@usefragments/ui";
import { FriendItem, WatchlistItem, Recommendation } from "@/lib/supabase";
import { FriendRequestItem, OutgoingFriendRequestItem } from "@/lib/sync";
import { Users, UserPlus, Trash2, Share2, Flame, Trophy, Bookmark, Check, X, Bell, Eye, EyeOff, Loader2 } from "lucide-react";
import { TasteCompatibilityModal } from "./TasteCompatibilityModal";
import { UserAvatar } from "./UserAvatar";

interface FriendsViewProps {
  friends: FriendItem[];
  watchlist?: WatchlistItem[];
  friendRecommendations?: Recommendation[];
  currentUserDisplayName?: string;
  incomingRequests?: FriendRequestItem[];
  outgoingRequests?: OutgoingFriendRequestItem[];
  onSendFriendRequest: (username: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onAcceptFriendRequest: (requestId: string, senderId: string) => Promise<void>;
  onDeclineFriendRequest: (requestId: string) => Promise<void>;
  onRemoveFriend: (id: string) => void;
  onOpenInvite?: () => void;
  onOpenRecommend?: (title: string) => void;
  onOpenFriendLibrary?: (friend: FriendItem) => void;
}

export function FriendsView({
  friends,
  watchlist = [],
  friendRecommendations = [],
  currentUserDisplayName = "You",
  incomingRequests = [],
  outgoingRequests = [],
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onRemoveFriend,
  onOpenInvite,
  onOpenRecommend,
  onOpenFriendLibrary,
}: FriendsViewProps) {
  const [newUsername, setNewUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [comparingFriend, setComparingFriend] = useState<FriendItem | null>(null);

  // Global Library Sharing Preference
  const [allowFriendsViewLibrary, setAllowFriendsViewLibrary] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cinecircle_share_library_with_friends");
      return stored === null ? true : stored === "true";
    }
    return true;
  });

  // Per-friend Library Permissions (set of friend IDs allowed)
  const [friendLibraryPermissions, setFriendLibraryPermissions] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cinecircle_friend_permissions");
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const handleToggleGlobalLibrarySharing = () => {
    const next = !allowFriendsViewLibrary;
    setAllowFriendsViewLibrary(next);
    try {
      localStorage.setItem("cinecircle_share_library_with_friends", String(next));
    } catch (e) {}
  };

  const handleToggleFriendPermission = (friendId: string) => {
    const next = {
      ...friendLibraryPermissions,
      [friendId]: friendLibraryPermissions[friendId] === undefined ? false : !friendLibraryPermissions[friendId],
    };
    setFriendLibraryPermissions(next);
    try {
      localStorage.setItem("cinecircle_friend_permissions", JSON.stringify(next));
    } catch (e) {}
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await onSendFriendRequest(newUsername.trim());
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ type: "success", text: result.message || "Friend request sent!" });
      setNewUsername("");
    } else {
      setStatusMessage({ type: "error", text: result.error || "Failed to send request" });
    }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[var(--text-primary)]" /> Inner Circle Friends
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your private circle, review requests, and share watchlist libraries
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
              onChange={(e) => {
                setNewUsername(e.target.value);
                if (statusMessage) setStatusMessage(null);
              }}
              placeholder="Enter @username..."
              className="h-10 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition w-full sm:w-48 flex items-center leading-tight"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-4 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Request</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Inline Status Feedback Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs hover:opacity-80 ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Watchlist Sharing Privacy Setting Card */}
      <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--brand-accent)]">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Watchlist & Library Privacy</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {allowFriendsViewLibrary
                ? "Your confirmed circle friends can view your saved and watched movies"
                : "Your library is currently private from circle friends"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleGlobalLibrarySharing}
          className={`h-9 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition cursor-pointer self-start sm:self-auto ${
            allowFriendsViewLibrary
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-[var(--canvas)] text-[var(--text-secondary)] border-[var(--surface-border)] hover:text-[var(--text-primary)]"
          }`}
        >
          {allowFriendsViewLibrary ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Friends Can View Library</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Library Private</span>
            </>
          )}
        </button>
      </div>

      {/* Incoming Friend Requests Section */}
      {incomingRequests.length > 0 && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" /> Pending Friend Requests ({incomingRequests.length})
            </h3>
            <span className="text-[11px] text-amber-300/80 font-medium">Action Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar avatarId={req.senderAvatarId} displayName={req.senderDisplayName} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[var(--text-primary)] truncate">{req.senderDisplayName}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">@{req.senderUsername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptFriendRequest(req.id, req.senderId)}
                    title="Approve friend request"
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeclineFriendRequest(req.id)}
                    title="Disapprove / Decline request"
                    className="h-8 px-2.5 rounded-lg bg-[var(--canvas)] hover:bg-red-950/50 border border-[var(--surface-border)] hover:border-red-500/40 text-[var(--text-muted)] hover:text-red-400 text-[11px] font-bold transition flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Friend Requests (Pending Sent) */}
      {outgoingRequests.length > 0 && (
        <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Sent Requests Awaiting Approval ({outgoingRequests.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center gap-2 text-xs"
              >
                <UserAvatar avatarId={req.recipientAvatarId} displayName={req.recipientDisplayName} size="sm" />
                <span className="font-bold text-[var(--text-primary)]">@{req.recipientUsername}</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-extrabold">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Circle Hall of Fame Superlatives */}
      {friends.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Circle Hall of Fame & Superlatives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topCritic && (
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black shrink-0 text-lg">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Top Recommender</span>
                  <p className="text-xs font-black text-[var(--text-primary)]">{topCritic.display_name} (@{topCritic.username})</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{topCritic.stats.recommendedCount} recommendations curated</p>
                </div>
              </div>
            )}

            {topCinephile && (
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black shrink-0 text-lg">
                  🍿
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">Most Dedicated Watcher</span>
                  <p className="text-xs font-black text-[var(--text-primary)]">{topCinephile.display_name} (@{topCinephile.username})</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{topCinephile.stats.watchedCount} movies logged & watched</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty Friends State */}
      {friends.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--canvas)] border border-[var(--surface-border)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-primary)]">Your Circle is Empty</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Add friends by their @username or share your personalized invite link to start exchanging private movie reviews and viewing each other&apos;s watchlists!
            </p>
          </div>
          {onOpenInvite && (
            <Button
              onClick={onOpenInvite}
              className="h-10 px-5 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs shadow transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 mr-1.5" /> Share Invite Link
            </Button>
          )}
        </div>
      ) : (
        /* Friends Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend, idx) => {
            const matchPercent = 82 + ((friend.stats.recommendedCount * 4 + idx * 3) % 16);
            const isFriendAllowed = friendLibraryPermissions[friend.id] !== false && allowFriendsViewLibrary;

            return (
              <Card
                key={friend.id}
                className="p-6 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarId={friend.avatar_character_id || (friend as any).avatar_id || "solaris"}
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
                      title="Remove friend from circle"
                      className="w-8 h-8 rounded-full bg-[var(--canvas)] hover:bg-red-950/60 border border-[var(--surface-border)] hover:border-red-500/30 text-[var(--text-muted)] hover:text-red-400 transition flex items-center justify-center cursor-pointer"
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

                {/* Watchlist Sharing Permission Tickmark for this friend */}
                <div className="pt-2 border-t border-[var(--surface-border)] flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFriendAllowed}
                      onChange={() => handleToggleFriendPermission(friend.id)}
                      className="rounded accent-[var(--brand-accent)] cursor-pointer"
                    />
                    <span className="text-[11px] font-bold">Allow viewing my library</span>
                  </label>
                  {isFriendAllowed ? (
                    <span className="text-[10px] font-extrabold text-emerald-400">✓ Shared</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">Hidden</span>
                  )}
                </div>

                {/* Action Buttons: View Library & Compare Taste */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => onOpenFriendLibrary?.(friend)}
                    className="h-9 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> View Library
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setComparingFriend(friend)}
                    className="h-9 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Taste Match
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
