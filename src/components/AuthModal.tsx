"use client";

import { useState } from "react";
import { Card, Button, IconButton, Avatar, Alert } from "@usefragments/ui";
import { supabase } from "@/lib/supabase";
import { getAvatarById } from "@/constants/avatars";
import { checkUsernameAvailable } from "@/lib/sync";
import { X, Lock, Mail, UserCheck, LogIn, AlertCircle, Eye, EyeOff, CheckCircle2, Sparkles } from "lucide-react";
import { AvatarPickerModal } from "./AvatarPickerModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { email: string; displayName: string; username: string; avatarId: string; age?: string }) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"SIGN_IN" | "SIGN_UP" | "VERIFY_NOTICE">("SIGN_IN");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("tony_stark");
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // UX Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthGoogle = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google sign in.");
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const meta = data.user.user_metadata || {};
        onAuthSuccess({
          email: data.user.email || email,
          displayName: meta.display_name || email.split("@")[0],
          username: meta.username || email.split("@")[0],
          avatarId: meta.avatar_id || selectedAvatarId,
          age: meta.age,
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg("Please enter a username.");
      return;
    }

    setLoading(true);

    try {
      const isAvailable = await checkUsernameAvailable(cleanUsername);
      if (!isAvailable) {
        setErrorMsg(`The username @${cleanUsername} is already taken. Please choose another username.`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim() || email.split("@")[0],
            username: cleanUsername,
            age: age.trim(),
            avatar_id: selectedAvatarId,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username: username.trim().toLowerCase() || email.split("@")[0],
            display_name: displayName.trim() || email.split("@")[0],
            avatar_character_id: selectedAvatarId,
          },
        ]);
      }

      setMode("VERIFY_NOTICE");
    } catch (err: any) {
      setMode("VERIFY_NOTICE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
        <Card className="relative w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-full bg-[var(--brand-accent)] text-[var(--brand-accent-text)] font-black text-sm flex items-center justify-center shadow">
                C
              </Avatar>
              <div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                  {mode === "VERIFY_NOTICE"
                    ? "Verification Email Sent"
                    : mode === "SIGN_UP"
                    ? "Create Your Account"
                    : "Welcome Back"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {mode === "VERIFY_NOTICE"
                    ? "Please check your email inbox"
                    : mode === "SIGN_UP"
                    ? "Join your private film circle"
                    : "Sign in to CineCircle"}
                </p>
              </div>
            </div>

            <IconButton
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--surface-border)]"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <Alert className="p-3.5 bg-red-950/60 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </Alert>
          )}

          {/* VERIFICATION NOTICE */}
          {mode === "VERIFY_NOTICE" ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-[var(--text-primary)] text-base">Check Your Email</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  We&apos;ve sent a verification link to <span className="text-[var(--text-primary)] font-bold">{email}</span>. Please click the link in your email inbox to activate your account.
                </p>
              </div>

              <div className="p-3 bg-[var(--canvas)] border border-[var(--surface-border)] rounded-xl text-[11px] text-[var(--text-secondary)]">
                💡 Don&apos;t see it? Check your spam/junk folder.
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    onAuthSuccess({
                      email,
                      displayName: displayName || email.split("@")[0],
                      username: username || email.split("@")[0],
                      avatarId: selectedAvatarId,
                      age,
                    });
                    onClose();
                  }}
                  className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow transition"
                >
                  Continue to App
                </Button>

                <Button
                  onClick={() => setMode("SIGN_IN")}
                  className="w-full h-11 bg-[var(--canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs rounded-xl transition font-semibold border border-[var(--surface-border)]"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Sign-In Only */}
              <div className="space-y-2.5">
                <Button
                  onClick={handleOAuthGoogle}
                  className="w-full h-12 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-[var(--surface-border)] shadow"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[var(--surface-border)] w-full" />
                <span className="bg-[var(--surface-card)] px-3 text-[10px] uppercase font-bold text-[var(--text-secondary)] shrink-0">
                  {mode === "SIGN_UP" ? "or register with email" : "or email sign in"}
                </span>
              </div>

              {/* FORM: SIGN IN */}
              {mode === "SIGN_IN" && (
                <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}

              {/* FORM: REGISTER */}
              {mode === "SIGN_UP" && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Tony Stark"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Username</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. ironman"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Age</label>
                    <input
                      type="number"
                      min={12}
                      max={120}
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                    />
                  </div>

                  {/* Avatar Selection Hero Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Your CineCircle Character Persona</label>
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

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
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
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition leading-tight flex items-center"
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
                    disabled={loading}
                    className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    {loading ? "Creating Account..." : "Create Account & Send Verification"}
                  </Button>
                </form>
              )}

              {/* Toggle Mode Footer */}
              <div className="text-center pt-2 border-t border-[var(--surface-border)]">
                <Button
                  type="button"
                  onClick={() => setMode(mode === "SIGN_UP" ? "SIGN_IN" : "SIGN_UP")}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition font-semibold bg-transparent border-0 shadow-none p-0"
                >
                  {mode === "SIGN_UP"
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Create One"}
                </Button>
              </div>
            </>
          )}
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
