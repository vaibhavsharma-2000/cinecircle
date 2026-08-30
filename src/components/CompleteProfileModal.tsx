"use client";

import { useState, useEffect } from "react";
import { Card, Button, IconButton } from "@usefragments/ui";
import { getAvatarById } from "@/constants/avatars";
import { checkUsernameAvailable } from "@/lib/sync";
import { supabase } from "@/lib/supabase";
import { User, Sparkles, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface CompleteProfileModalProps {
  isOpen: boolean;
  userId: string;
  initialDisplayName?: string;
  initialEmail?: string;
  onComplete: (profile: { displayName: string; username: string; avatarId: string; age: string }) => void;
}

export function CompleteProfileModal({
  isOpen,
  userId,
  initialDisplayName = "",
  initialEmail = "",
  onComplete,
}: CompleteProfileModalProps) {
  const defaultDisplayName = initialDisplayName || initialEmail.split("@")[0] || "Cinephile";
  const defaultUsername = initialEmail.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") || "movie_buff";

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [username, setUsername] = useState(defaultUsername);
  const [age, setAge] = useState("24");
  const [selectedAvatarId, setSelectedAvatarId] = useState("tony_stark");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialDisplayName) setDisplayName(initialDisplayName);
    if (initialEmail) {
      const derived = initialEmail.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (derived) setUsername(derived);
    }
  }, [initialDisplayName, initialEmail]);

  // Debounced username availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(clean, userId);
      setIsUsernameAvailable(available);
      setIsCheckingUsername(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [username, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim() || defaultDisplayName;

    if (!cleanUsername) {
      setErrorMsg("Please choose a unique @username handle.");
      return;
    }

    if (isUsernameAvailable === false) {
      setErrorMsg(`The handle @${cleanUsername} is already taken by another user.`);
      return;
    }

    setSubmitting(true);

    try {
      // Re-verify availability
      const isAvailable = await checkUsernameAvailable(cleanUsername, userId);
      if (!isAvailable) {
        setErrorMsg(`The handle @${cleanUsername} is taken. Please pick another one.`);
        setSubmitting(false);
        return;
      }

      // Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          display_name: cleanDisplayName,
          username: cleanUsername,
          avatar_id: selectedAvatarId,
          age: age,
        },
      });

      onComplete({
        displayName: cleanDisplayName,
        username: cleanUsername,
        avatarId: selectedAvatarId,
        age: age,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
        <Card className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--surface-border)] pb-4">
            <div className="w-11 h-11 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Complete Your Profile</h3>
              <p className="text-xs text-[var(--text-secondary)]">Set up your username and character persona</p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Tony Stark"
                className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
              />
            </div>

            {/* Username / Handle with Uniqueness Check */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Choose Unique Handle (@username)</label>
                {isCheckingUsername && (
                  <span className="text-[10px] text-[var(--text-muted)] animate-pulse">Checking...</span>
                )}
                {!isCheckingUsername && isUsernameAvailable === true && username.trim() && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                )}
                {!isCheckingUsername && isUsernameAvailable === false && username.trim() && (
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Taken
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-black text-[var(--text-muted)]">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="ironman"
                  className={`w-full h-11 bg-[var(--canvas)] border text-xs rounded-xl pl-8 pr-4 text-[var(--text-primary)] focus:outline-none transition ${
                    isUsernameAvailable === false
                      ? "border-red-500/60 focus:border-red-500"
                      : isUsernameAvailable === true
                      ? "border-emerald-500/60 focus:border-emerald-500"
                      : "border-[var(--surface-border)] focus:border-[var(--brand-accent)]"
                  }`}
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Age</label>
              <input
                type="number"
                min={12}
                max={120}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
              />
            </div>

            {/* Avatar Persona Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Select Your Character Persona</label>
              <div className="p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--brand-accent)] shadow shrink-0">
                    <img
                      src={getAvatarById(selectedAvatarId).imageUrl}
                      alt={getAvatarById(selectedAvatarId).name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] truncate">
                      {getAvatarById(selectedAvatarId).name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">
                      {getAvatarById(selectedAvatarId).showMovie}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="h-9 px-3.5 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--surface-border)] font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Browse Vault
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || isUsernameAvailable === false}
              className="w-full h-12 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {submitting ? "Saving Profile..." : "Save Profile & Enter CineCircle"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Crunchyroll-Style Character Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={selectedAvatarId}
        onSelectAvatar={(avatarId) => setSelectedAvatarId(avatarId)}
      />
    </>
  );
}
