"use client";

import { useState } from "react";
import { Button, IconButton, Alert } from "@usefragments/ui";
import { supabase } from "@/lib/supabase";
import { AVVVATAR_PRESETS } from "@/constants/avatars";
import { UserAvatar } from "./UserAvatar";
import { checkUsernameAvailable } from "@/lib/sync";
import { authErrorMessage, sanitizeUsername } from "@/lib/authErrors";
import { useDialog } from "@/lib/useDialog";
import { X, Check, Trash2, AlertTriangle, ShieldAlert, KeyRound, Eye, EyeOff, Mail, CheckCircle2, Sparkles } from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  currentUserId?: string;
  authProvider: string | null;
  currentAvatarId: string;
  currentDisplayName: string;
  currentUsername: string;
  currentAge?: string;
  /** Resolves to an error message, or null on success. */
  onSaveProfile: (updated: { avatarId: string; displayName: string; username: string; age?: string }) => Promise<string | null>;
  /** Resolves to an error message, or null on success. */
  onDeleteAccount: () => Promise<string | null>;
}

const inputClass =
  "w-full h-12 bg-[var(--canvas)] border border-[var(--surface-border)] text-base sm:text-sm rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] transition";
const labelClass = "text-sm font-bold text-[var(--text-secondary)]";

export function AccountModal({
  isOpen,
  onClose,
  userEmail,
  currentUserId,
  authProvider,
  currentAvatarId,
  currentDisplayName,
  currentUsername,
  currentAge = "",
  onSaveProfile,
  onDeleteAccount,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECURITY">("PROFILE");

  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [username, setUsername] = useState(currentUsername);
  const [age, setAge] = useState(currentAge);
  const [saving, setSaving] = useState(false);

  const [passwordMethod, setPasswordMethod] = useState<"DIRECT" | "EMAIL">("DIRECT");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const usesPassword = !authProvider || authProvider === "email";
  const isDirty =
    displayName !== currentDisplayName ||
    username !== currentUsername ||
    age !== currentAge ||
    selectedAvatarId !== currentAvatarId ||
    Boolean(newPassword || confirmPassword);
  const dialogRef = useDialog<HTMLDivElement>(isOpen && !isAvatarPickerOpen, onClose);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError(null);
    setNotice(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const cleanUsername = sanitizeUsername(username.trim());
    if (!cleanUsername) {
      setError("Choose a username with letters, numbers, or underscores.");
      return;
    }
    setSaving(true);
    const isAvailable = await checkUsernameAvailable(cleanUsername, currentUserId);
    if (!isAvailable) {
      setSaving(false);
      setError(`@${cleanUsername} is already taken. Choose a different username.`);
      return;
    }
    const saveError = await onSaveProfile({
      avatarId: selectedAvatarId,
      displayName: displayName.trim() || cleanUsername,
      username: cleanUsername,
      age: age.trim(),
    });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    onClose();
  };

  const handleSendResetEmail = async () => {
    resetMessages();
    if (!userEmail) return;
    setSecurityLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSecurityLoading(false);
    if (resetError) {
      setError(authErrorMessage(resetError));
      return;
    }
    setNotice(`Reset link sent to ${userEmail}.`);
  };

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (newPassword.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match. Re-enter the same password in both fields.");
      return;
    }
    setSecurityLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSecurityLoading(false);
    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }
    setNotice("Password updated.");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDelete = async () => {
    resetMessages();
    setDeleting(true);
    const deleteError = await onDeleteAccount();
    setDeleting(false);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    onClose();
  };

  const tabButton = (tab: "PROFILE" | "SECURITY", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === tab}
      onClick={() => {
        setActiveTab(tab);
        resetMessages();
      }}
      className={`flex-1 h-11 text-sm font-extrabold rounded-lg transition cursor-pointer ${
        activeTab === tab
          ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
        onClick={() => !isDirty && onClose()}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-title"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="relative w-full sm:max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-t-3xl sm:rounded-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 id="account-title" className="font-extrabold text-xl text-[var(--text-primary)]">Account Settings</h2>
              <p className="text-sm text-[var(--text-secondary)]">Profile, password, and account deletion</p>
            </div>
            <IconButton
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 -mr-2 -mt-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center justify-center transition shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          <div role="tablist" aria-label="Account sections" className="flex items-center gap-1 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--surface-border)]">
            {tabButton("PROFILE", "Profile")}
            {tabButton("SECURITY", "Security")}
          </div>

          {notice && (
            <Alert role="status" className="bg-[var(--success-subtle)] border border-[var(--success-border)] text-[var(--success-text)] text-sm flex items-center gap-2 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </Alert>
          )}

          {error && (
            <Alert role="alert" className="bg-[var(--danger-subtle)] border border-[var(--danger-border)] text-[var(--danger-text)] text-sm flex items-center gap-2 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </Alert>
          )}

          {activeTab === "PROFILE" && (
            <form onSubmit={handleSaveProfile} method="post" action="#" autoComplete="on" className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="account-display-name" className={labelClass}>Display Name</label>
                  <input
                    id="account-display-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="account-username" className={labelClass}>Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--text-muted)]" aria-hidden="true">@</span>
                    <input
                      id="account-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      required
                      value={username}
                      onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="account-email" className={labelClass}>Email</label>
                  <input
                    id="account-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled
                    value={userEmail || ""}
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="account-age" className={labelClass}>
                    Age <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <input
                    id="account-age"
                    name="age"
                    type="number"
                    inputMode="numeric"
                    min={12}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={inputClass}
                  />
                </div>
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

                <div className="flex items-center gap-3 p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl">
                  <div className="rounded-full ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--canvas)] shrink-0 overflow-hidden">
                    <UserAvatar avatarId={selectedAvatarId} displayName={username || displayName || "You"} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-[var(--text-primary)] truncate">@{username || "username"}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{displayName}</p>
                  </div>
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
                          isSelected
                            ? "ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--surface-card)]"
                            : "opacity-70 hover:opacity-100"
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
                disabled={saving}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Check className="w-4 h-4" aria-hidden="true" /> {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          )}

          {activeTab === "SECURITY" && (
            <div className="space-y-6">
              {usesPassword ? (
                <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[var(--brand-accent)]" aria-hidden="true" /> Password
                    </h3>
                    <div role="tablist" aria-label="Password change method" className="flex items-center gap-1 bg-[var(--surface-card)] p-1 rounded-lg border border-[var(--surface-border)]">
                      {(["DIRECT", "EMAIL"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          role="tab"
                          aria-selected={passwordMethod === m}
                          onClick={() => {
                            setPasswordMethod(m);
                            resetMessages();
                          }}
                          className={`h-9 px-3 rounded-md text-xs font-bold transition cursor-pointer ${
                            passwordMethod === m ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm" : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {m === "DIRECT" ? "Change Here" : "Email Link"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {passwordMethod === "DIRECT" ? (
                    <form onSubmit={handleDirectPasswordChange} method="post" action="#" autoComplete="on" className="space-y-3">
                      <input type="text" name="username" autoComplete="username" value={userEmail || ""} readOnly className="sr-only" tabIndex={-1} aria-hidden="true" />
                      {[
                        { id: "account-new-password", label: "New Password", value: newPassword, set: setNewPassword, placeholder: "At least 6 characters" },
                        { id: "account-confirm-password", label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, placeholder: "" },
                      ].map((f) => (
                        <div key={f.id} className="space-y-1.5">
                          <label htmlFor={f.id} className={labelClass}>{f.label}</label>
                          <div className="relative flex items-center">
                            <input
                              id={f.id}
                              name={f.id}
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              required
                              value={f.value}
                              onChange={(e) => f.set(e.target.value)}
                              placeholder={f.placeholder || undefined}
                              className={`${inputClass} pr-12`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              aria-pressed={showPassword}
                              className="absolute right-0 w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="submit"
                        disabled={securityLoading}
                        className="w-full h-12 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow transition disabled:opacity-60"
                      >
                        {securityLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-secondary)]">
                        A reset link will be sent to <strong className="text-[var(--text-primary)]">{userEmail}</strong>.
                      </p>
                      <Button
                        type="button"
                        onClick={handleSendResetEmail}
                        disabled={securityLoading}
                        className="w-full h-12 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Mail className="w-4 h-4 text-[var(--brand-accent)]" aria-hidden="true" />
                        {securityLoading ? "Sending Link..." : "Send Reset Link"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl text-sm text-[var(--text-secondary)]">
                  You sign in with Google, so there&apos;s no CineCircle password to change. Manage your password in your Google account.
                </div>
              )}

              <div className="p-4 bg-[var(--danger-subtle)] border border-[var(--danger-border)] rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-[var(--danger)] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" /> Delete Account
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Permanently removes your profile, library, ratings, recommendations, and friend connections. This can&apos;t be undone.
                </p>

                {!showConfirmDelete ? (
                  <Button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="h-11 px-4 bg-[var(--canvas)] text-[var(--danger)] hover:bg-[var(--danger-subtle)] border border-[var(--danger-border)] font-bold text-sm rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete Account...
                  </Button>
                ) : (
                  <div className="p-3 bg-[var(--canvas)] border border-[var(--danger-border)] rounded-xl space-y-3">
                    <label htmlFor="delete-confirm" className="block text-sm font-bold text-[var(--danger-text)]">
                      Type <span className="font-black">{currentUsername}</span> to confirm
                    </label>
                    <input
                      id="delete-confirm"
                      type="text"
                      autoComplete="off"
                      autoCapitalize="none"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className={inputClass}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowConfirmDelete(false);
                          setDeleteConfirmText("");
                        }}
                        className="h-11 px-4 bg-[var(--surface-card)] text-[var(--text-primary)] text-sm rounded-xl transition border border-[var(--surface-border)] font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || deleteConfirmText.trim().toLowerCase() !== currentUsername.toLowerCase()}
                        className="flex-1 h-11 bg-[var(--danger)] hover:opacity-90 text-white font-extrabold text-sm rounded-xl shadow transition disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
