"use client";

import { useState } from "react";
import { Button, IconButton } from "@usefragments/ui";
import { AVVVATAR_PRESETS, DEFAULT_AVATAR_ID } from "@/constants/avatars";
import { UserAvatar } from "./UserAvatar";
import Avvvatars from "avvvatars-react";
import { X, Check, Sparkles } from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  username?: string;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
  username = "username",
}: AvatarPickerModalProps) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedAvatarId || DEFAULT_AVATAR_ID);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectAvatar(tempSelectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Choose Your Avatar</h3>
              <p className="text-xs text-[var(--text-secondary)]">Pick a design for @{username || "your_profile"}</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Clean Avatar Icon Grid (No text / no labels, just the pic) */}
        <div className="overflow-y-auto flex-1 p-2 pr-1 scrollbar-thin">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-2">
            {AVVVATAR_PRESETS.map((seed) => {
              const isSelected = tempSelectedId === seed;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setTempSelectedId(seed)}
                  className={`group relative flex items-center justify-center p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--canvas)] border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--surface-card)] scale-110 shadow-lg"
                      : "bg-[var(--canvas)]/40 border-[var(--surface-border)] hover:border-white/40 hover:bg-[var(--canvas)] hover:scale-105"
                  }`}
                >
                  <div className="relative rounded-full overflow-hidden shadow-sm">
                    <Avvvatars value={seed} style="shape" size={54} shadow={false} />
                    
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-150">
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Avatar Live Preview Footer */}
        <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="rounded-full ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--canvas)] shadow shrink-0 overflow-hidden">
              <UserAvatar avatarId={tempSelectedId} displayName={username} size="lg" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase text-[var(--brand-accent)] tracking-wider block">
                Selected Avatar
              </span>
              <h4 className="font-extrabold text-sm text-[var(--text-primary)] truncate">
                @{username || "username"}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-transparent hover:bg-[var(--surface-card)] text-[var(--text-secondary)] font-bold text-xs rounded-xl border border-[var(--surface-border)] transition cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="h-10 px-5 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Select Avatar
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
