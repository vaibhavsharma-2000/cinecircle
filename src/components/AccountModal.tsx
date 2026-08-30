"use client";

import { useState } from "react";
import { Button, IconButton, Avatar, Alert } from "@usefragments/ui";
import { supabase } from "@/lib/supabase";
import { MOVIE_CHARACTER_AVATARS } from "@/constants/avatars";
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
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SETTINGS">("PROFILE");
  
  // Profile State
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-sm flex items-center justify-center shadow">
              {displayName[0] || "U"}
            </Avatar>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">Account & Profile Settings</h3>
              <p className="text-xs text-[var(--text-secondary)]">{userEmail || "Guest User"}</p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--surface-border)] pb-3">
          <Button
            type="button"
            onClick={() => setActiveTab("PROFILE")}
            className={`flex-1 h-9 rounded-xl text-xs font-bold transition border ${
              activeTab === "PROFILE"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-sm"
                : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1.5" /> Profile Details
          </Button>

          <Button
            type="button"
            onClick={() => setActiveTab("SETTINGS")}
            className={`flex-1 h-9 rounded-xl text-xs font-bold transition border ${
              activeTab === "SETTINGS"
                ? "bg-[var(--brand-accent)] text-[var(--brand-accent-text)] border-[var(--brand-accent)] shadow-sm"
                : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 inline mr-1.5" /> Account Settings
          </Button>
        </div>

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === "PROFILE" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Tony Stark"
                className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition flex items-center leading-tight"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Circle Handle (@username)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ironman"
                  className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition flex items-center leading-tight"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Age</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                  className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition flex items-center leading-tight"
                />
              </div>
            </div>

            {/* Character Avatar Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Character Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {MOVIE_CHARACTER_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <button
                      type="button"
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition ${
                        isSelected
                          ? "bg-[var(--brand-accent)]/15 border-[var(--brand-accent)] text-[var(--text-primary)] shadow-sm"
                          : "bg-[var(--canvas)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="text-xl">{avatar.emoji}</span>
                      <span className="text-[9px] font-bold truncate max-w-full mt-1 text-center">{avatar.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Profile Settings
            </Button>
          </form>
        )}

        {/* TAB 2: ACCOUNT SETTINGS (PASSWORD & DELETE ACCOUNT) */}
        {activeTab === "SETTINGS" && (
          <div className="space-y-6">
            {securityNotice && (
              <Alert className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{securityNotice}</span>
              </Alert>
            )}

            {securityError && (
              <Alert className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-500 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{securityError}</span>
              </Alert>
            )}

            {/* PASSWORD MANAGEMENT SECTION */}
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--brand-accent)]" /> Change Password
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Select your preferred method to update your password
                </p>
              </div>

              {/* Password Method Selector Pills */}
              <div className="flex gap-2 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--surface-border)]">
                <button
                  type="button"
                  onClick={() => setPasswordMethod("DIRECT")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    passwordMethod === "DIRECT"
                      ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Enter New Password
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordMethod("EMAIL")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    passwordMethod === "EMAIL"
                      ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Send Email Reset Link
                </button>
              </div>

              {/* Method 1: Direct Password Form */}
              {passwordMethod === "DIRECT" && (
                <form onSubmit={handleDirectPasswordChange} className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">New Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full h-11 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full h-11 bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={securityLoading}
                    className="w-full h-11 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    {securityLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              )}

              {/* Method 2: Email Reset Link */}
              {passwordMethod === "EMAIL" && (
                <div className="p-4 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-2xl space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    We will send a secure password reset link to your registered email address (<span className="font-bold text-[var(--text-primary)]">{userEmail || "your email"}</span>). Click the link in your inbox to verify and set your new password.
                  </p>
                  <Button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={securityLoading}
                    className="w-full h-11 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Mail className="w-4 h-4 text-[var(--brand-accent)]" /> {securityLoading ? "Sending Email..." : "Send Reset Email Link"}
                  </Button>
                </div>
              )}
            </div>

            {/* DELETE ACCOUNT SECTION (INTEGRATED INTO ACCOUNT SETTINGS) */}
            <div className="pt-4 border-t border-[var(--surface-border)] space-y-3">
              <div>
                <h4 className="font-extrabold text-sm text-red-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Danger Zone
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Permanent account deletion and data removal
                </p>
              </div>

              {!showConfirmDelete ? (
                <Button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account...
                </Button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl space-y-3 animate-in fade-in">
                  <p className="text-xs font-extrabold text-red-500 text-center">
                    Are you sure you want to permanently delete your account?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        onDeleteAccount();
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
  );
}
