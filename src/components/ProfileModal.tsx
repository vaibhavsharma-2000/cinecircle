"use client";

import { useState } from "react";
import { Button, IconButton, Input } from "@usefragments/ui";
import { X, Check, Sparkles } from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { UserAvatar } from "./UserAvatar";

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
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
            <div className="flex items-center gap-3">
              <UserAvatar avatarId={selectedAvatarId} displayName={displayName} size="md" />
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

            {/* Avatar Selection Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Your Profile Avatar</label>
              <div className="p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-full ring-2 ring-[var(--brand-accent)] shadow shrink-0 overflow-hidden">
                    <UserAvatar
                      avatarId={selectedAvatarId}
                      displayName={username || displayName || "You"}
                      size="lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] truncate">
                      @{username || currentUsername || "username"}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">
                      {displayName || currentDisplayName}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="h-9 px-3.5 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--surface-border)] font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Choose Avatar
                </Button>
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

      {/* Avvvatars Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={selectedAvatarId}
        onSelectAvatar={(avatarId) => setSelectedAvatarId(avatarId)}
        username={username || currentUsername || "username"}
      />
    </>
  );
}
