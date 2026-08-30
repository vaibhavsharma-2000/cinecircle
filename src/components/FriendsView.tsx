"use client";

import { useState } from "react";
import { Card, Button, IconButton, Avatar, Badge, Input } from "@usefragments/ui";
import { FriendItem } from "@/lib/supabase";
import { Users, UserPlus, Trash2 } from "lucide-react";

interface FriendsViewProps {
  friends: FriendItem[];
  onAddFriend: (username: string) => void;
  onRemoveFriend: (id: string) => void;
}

export function FriendsView({
  friends,
  onAddFriend,
  onRemoveFriend,
}: FriendsViewProps) {
  const [newUsername, setNewUsername] = useState("");

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

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header & Add Friend Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--surface-border)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[var(--text-primary)]" /> Inner Circle Friends
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your private circle to exchange high-trust film and series reviews
          </p>
        </div>

        {/* Add Friend Input Form */}
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Add @username..."
            className="h-10 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition w-full sm:w-60 flex items-center leading-tight"
          />
          <Button
            type="submit"
            className="h-10 px-5 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add
          </Button>
        </form>
      </div>

      {/* Friends Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <Card
            key={friend.id}
            className="p-6 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-sm flex items-center justify-center shadow">
                  {friend.display_name[0]}
                </Avatar>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">{friend.display_name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">@{friend.username}</p>
                </div>
              </div>

              <IconButton
                onClick={() => onRemoveFriend(friend.id)}
                className="w-9 h-9 rounded-full bg-[var(--canvas)] hover:bg-red-950/60 border border-[var(--surface-border)] hover:border-red-500/30 text-[var(--text-muted)] hover:text-red-400 transition flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
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
          </Card>
        ))}
      </div>
    </div>
  );
}
