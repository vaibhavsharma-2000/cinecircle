"use client";

import { useState, useEffect } from "react";
import { Button } from "@usefragments/ui";
import { DEFAULT_AVATAR_ID, AVVVATAR_PRESETS } from "@/constants/avatars";
import { UserAvatar } from "./UserAvatar";
import { checkUsernameAvailable } from "@/lib/sync";
import { supabase } from "@/lib/supabase";
import { authErrorMessage, sanitizeUsername } from "@/lib/authErrors";
import { useDialog } from "@/lib/useDialog";
import { Sparkles, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface CompleteProfileModalProps {
  isOpen: boolean;
  userId: string;
  initialDisplayName?: string;
  initialEmail?: string;
  onSignOut: () => void;
  onComplete: (profile: { displayName: string; username: string; avatarId: string; age: string }) => void;
}

const inputClass =
  "w-full h-12 bg-[var(--canvas)] border text-base sm:text-sm rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] transition";
const labelClass = "text-sm font-bold text-[var(--text-secondary)]";

export function CompleteProfileModal({
  isOpen,
  userId,
  initialDisplayName = "",
  initialEmail = "",
  onSignOut,
  onComplete,
}: CompleteProfileModalProps) {
  const derivedUsername = sanitizeUsername(initialEmail.split("@")[0] || "");

  const [displayName, setDisplayName] = useState(initialDisplayName || initialEmail.split("@")[0] || "");
  const [username, setUsername] = useState(derivedUsername);
  const [age, setAge] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(DEFAULT_AVATAR_ID);

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useDialog<HTMLDivElement>(isOpen && !isAvatarPickerOpen);

  useEffect(() => {
    if (initialDisplayName) setDisplayName(initialDisplayName);
    if (derivedUsername) setUsername(derivedUsername);
  }, [initialDisplayName, derivedUsername]);

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setIsUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      setIsUsernameAvailable(await checkUsernameAvailable(username, userId));
      setIsCheckingUsername(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [username, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanDisplayName = displayName.trim() || username;

    if (!username) {
      setErrorMsg("Choose a username with letters, numbers, or underscores.");
      return;
    }

    setSubmitting(true);
    if (!(await checkUsernameAvailable(username, userId))) {
      setIsUsernameAvailable(false);
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { display_name: cleanDisplayName, username, avatar_id: selectedAvatarId, age },
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    onComplete({ displayName: cleanDisplayName, username, avatarId: selectedAvatarId, age });
  };

  const usernameTaken = isUsernameAvailable === false && Boolean(username);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-profile-title"
          className="relative w-full sm:max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
        >
          <div className="space-y-1">
            <h2 id="complete-profile-title" className="font-extrabold text-xl text-[var(--text-primary)]">Set Up Your Profile</h2>
            <p className="text-sm text-[var(--text-secondary)]">Friends find you by your username.</p>
          </div>

          {errorMsg && (
            <div role="alert" className="p-3.5 bg-[var(--danger-subtle)] border border-[var(--danger-border)] rounded-2xl flex items-center gap-2.5 text-sm text-[var(--danger-text)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" action="#" autoComplete="on" className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="complete-username" className={labelClass}>Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--text-muted)]" aria-hidden="true">@</span>
                <input
                  id="complete-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                  value={username}
                  onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                  placeholder="moviebuff"
                  aria-invalid={usernameTaken || undefined}
                  aria-describedby="complete-username-status"
                  className={`${inputClass} pl-8 ${
                    usernameTaken
                      ? "border-[var(--danger)]"
                      : isUsernameAvailable
                      ? "border-[var(--success)]"
                      : "border-[var(--surface-border)] focus:border-[var(--brand-accent)]"
                  }`}
                />
              </div>
              <p id="complete-username-status" aria-live="polite" className="text-xs min-h-4">
                {isCheckingUsername ? (
                  <span className="text-[var(--text-muted)]">Checking availability...</span>
                ) : usernameTaken ? (
                  <span className="font-semibold text-[var(--danger-text)] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> @{username} is taken. Try another.
                  </span>
                ) : isUsernameAvailable && username ? (
                  <span className="font-semibold text-[var(--success)] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> @{username} is available
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">Lowercase letters, numbers, and underscores.</span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="complete-display-name" className={labelClass}>Display Name</label>
              <input
                id="complete-display-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className={`${inputClass} border-[var(--surface-border)] focus:border-[var(--brand-accent)]`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="complete-age" className={labelClass}>
                Age <span className="font-normal text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                id="complete-age"
                name="age"
                type="number"
                inputMode="numeric"
                min={12}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`${inputClass} border-[var(--surface-border)] focus:border-[var(--brand-accent)]`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Avatar</span>
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="min-h-11 text-sm font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Browse All ({AVVVATAR_PRESETS.length})
                </button>
              </div>
              <div role="radiogroup" aria-label="Quick avatar choices" className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {AVVVATAR_PRESETS.slice(0, 10).map((preset) => {
                  const isSelected = selectedAvatarId === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Avatar ${preset}`}
                      onClick={() => setSelectedAvatarId(preset)}
                      className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isSelected ? "ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--surface-card)]" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <UserAvatar avatarId={preset} size="md" />
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || usernameTaken || !username}
              className="w-full h-12 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full h-11 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Not you? Sign Out
          </button>
        </div>
      </div>

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={selectedAvatarId}
        onSelectAvatar={(avatarId) => setSelectedAvatarId(avatarId)}
        username={username || "username"}
      />
    </>
  );
}
