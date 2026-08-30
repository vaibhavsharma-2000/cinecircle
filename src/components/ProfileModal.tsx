"use client";

import { useState } from "react";
import { Button, IconButton, Input, Avatar } from "@usefragments/ui";
import { MOVIE_CHARACTER_AVATARS } from "@/constants/avatars";
import { X, Check } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarId: string;
  currentDisplayName: string;
  currentUsername: string;
  onSave: (updated: { avatarId: string; displayName: string; username: string }) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentAvatarId,
  currentDisplayName,
  currentUsername,
  onSave,
}: ProfileModalProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [username, setUsername] = useState(currentUsername);

  const extractValue = (val: any): string => {
    if (typeof val === "string") return val;
    if (val && val.target && typeof val.target.value === "string") return val.target.value;
    return "";
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      avatarId: selectedAvatarId,
      displayName: displayName.trim() || "Tony Stark",
      username: username.trim() || "ironman",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-sm flex items-center justify-center shadow">
              {displayName[0]}
            </Avatar>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Edit Your Profile</h3>
              <p className="text-xs text-[var(--text-secondary)]">Customize your avatar and circle handle</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Display Name</label>
            <Input
              type="text"
              required
              value={displayName}
              onChange={(e: any) => setDisplayName(extractValue(e))}
              placeholder="e.g. Tony Stark"
              className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Circle Handle / Username</label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e: any) => setUsername(extractValue(e))}
              placeholder="e.g. ironman"
              className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
            />
          </div>

          {/* Avatar Character Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Choose Character Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {MOVIE_CHARACTER_AVATARS.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                return (
                  <button
                    type="button"
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center transition ${
                      isSelected
                        ? "bg-[var(--brand-accent)]/15 border-[var(--brand-accent)] text-[var(--text-primary)] shadow"
                        : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="text-xl">{avatar.emoji}</span>
                    <span className="text-[9px] font-bold truncate max-w-full mt-1">{avatar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Profile Changes
          </Button>
        </form>

      </div>
    </div>
  );
}
