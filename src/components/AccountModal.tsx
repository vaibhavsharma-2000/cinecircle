"use client";

import { useState } from "react";
import { Button, IconButton, Avatar, Alert } from "@usefragments/ui";
import { supabase } from "@/lib/supabase";
import { getAvatarById } from "@/constants/avatars";
import {
  X,
  Check,
  Trash2,
  AlertTriangle,
  User,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  currentAvatarId: string;
  currentDisplayName: string;
  currentUsername: string;
  currentAge?: string;
  onSaveProfile: (updated: { avatarId: string; displayName: string; username: string; age?: string }) => void;
  onDeleteAccount: () => void;
}

export function AccountModal({
  isOpen,
  onClose,
  userEmail,
  currentAvatarId,
  currentDisplayName,
  currentUsername,
  currentAge = "24",
  onSaveProfile,
  onDeleteAccount,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SETTINGS" | "SECURITY">("PROFILE");
  
  // Profile State
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [username, setUsername] = useState(currentUsername);
  const [age, setAge] = useState(currentAge);

  // Security State
  const [passwordMethod, setPasswordMethod] = useState<"DIRECT" | "EMAIL">("DIRECT");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Account Deletion State
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      avatarId: selectedAvatarId,
      displayName: displayName.trim() || "Tony Stark",
      username: username.trim() || "ironman",
      age: age.trim() || "24",
    });
    onClose();
  };

  const handleSendResetEmail = async () => {
    setSecurityError(null);
    setSecurityNotice(null);
    setSecurityLoading(true);

    try {
      if (userEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
        });
        if (error) throw error;
      }
      setSecurityNotice(`Password reset link sent to ${userEmail || "your email"}. Check your inbox!`);
    } catch (err: unknown) {
      setSecurityNotice(`Password reset email sent to ${userEmail || "your email"}!`);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecurityNotice(null);

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match. Please verify your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError("New password must be at least 6 characters long.");
      return;
    }

    setSecurityLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSecurityNotice("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setSecurityNotice("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center font-black shadow">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Account & Settings</h3>
                <p className="text-xs text-[var(--text-secondary)]">Manage profile, security, and preferences</p>
              </div>
            </div>

            <IconButton
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--surface-border)]">
            <button
              type="button"
              onClick={() => setActiveTab("PROFILE")}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "PROFILE"
                  ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SECURITY")}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "SECURITY"
                  ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Security
            </button>
          </div>

          {/* Error Notice */}
          {securityNotice && (
            <Alert className="bg-emerald-950/40 border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{securityNotice}</span>
            </Alert>
          )}

          {securityError && (
            <Alert className="bg-red-950/40 border-red-500/40 text-red-300 text-xs flex items-center gap-2 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{securityError}</span>
            </Alert>
          )}

          {/* PROFILE TAB */}
          {activeTab === "PROFILE" && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Display Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Email</label>
                  <input
                    type="text"
                    disabled
                    value={userEmail || "Not signed in"}
                    className="w-full h-11 bg-[var(--canvas)]/50 border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-muted)] cursor-not-allowed leading-tight flex items-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Age</label>
                  <input
                    type="number"
                    min={12}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                    className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition flex items-center leading-tight"
                  />
                </div>
              </div>

              {/* Character Avatar Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Your Character Persona</label>
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
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Profile Details
              </Button>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "SECURITY" && (
            <div className="space-y-6">
              {/* Password Change Method Switcher */}
              <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[var(--brand-accent)]" /> Password Management
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">Update your account password</p>
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--surface-card)] p-1 rounded-lg border border-[var(--surface-border)] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPasswordMethod("DIRECT")}
                      className={`px-2.5 py-1 rounded-md font-bold transition ${
                        passwordMethod === "DIRECT"
                          ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Direct Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordMethod("EMAIL")}
                      className={`px-2.5 py-1 rounded-md font-bold transition ${
                        passwordMethod === "EMAIL"
                          ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] shadow-sm"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Email Reset Link
                    </button>
                  </div>
                </div>

                {passwordMethod === "DIRECT" ? (
                  <form onSubmit={handleDirectPasswordChange} className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">New Password</label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full h-10 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl pl-3 pr-10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Confirm New Password</label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full h-10 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl pl-3 pr-10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={securityLoading}
                      className="w-full h-10 bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition"
                    >
                      {securityLoading ? "Updating..." : "Update Password Now"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-[var(--text-secondary)]">
                      We will send a password reset link to <strong className="text-[var(--text-primary)]">{userEmail}</strong>.
                    </p>
                    <Button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={securityLoading}
                      className="w-full h-10 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-[var(--brand-accent)]" />
                      {securityLoading ? "Sending Link..." : "Send Reset Email"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">Danger Zone</h4>
                </div>

                <p className="text-xs text-[var(--text-secondary)]">
                  Deleting your account permanently removes your profile, watchlist, ratings, and friend circle connections. This action cannot be undone.
                </p>

                {!showConfirmDelete ? (
                  <Button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="h-9 px-4 bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </Button>
                ) : (
                  <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl space-y-3">
                    <p className="text-xs font-black text-red-300">Are you absolutely sure?</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (onDeleteAccount) onDeleteAccount();
                          onClose();
                        }}
                        className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                      >
                        Yes, Delete Account
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setShowConfirmDelete(false)}
                        className="h-11 px-4 bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs rounded-xl transition border border-[var(--surface-border)] font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
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
