"use client";

import { useState, useEffect } from "react";
import { Button, IconButton, Alert } from "@usefragments/ui";
import { supabase } from "@/lib/supabase";
import { authErrorCode, authErrorMessage, signUpError } from "@/lib/authErrors";
import { useDialog } from "@/lib/useDialog";
import { X, Lock, Mail, UserCheck, LogIn, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound } from "lucide-react";

export type AuthMode = "SIGN_IN" | "SIGN_UP" | "FORGOT";
type Mode = AuthMode | "VERIFY_NOTICE" | "RESET_SENT";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

const HEADINGS: Record<Mode, [string, string]> = {
  SIGN_IN: ["Sign In", "See your circle's picks, your library, and your matches."],
  SIGN_UP: ["Create Account", "Save films, rate what you watch, and share picks with friends."],
  FORGOT: ["Reset Password", "Enter your account email to get a password reset link."],
  VERIFY_NOTICE: ["Check Your Email", "Open the verification link to activate your account."],
  RESET_SENT: ["Check Your Email", "Open the reset link to choose a new password."],
};

const inputClass =
  "w-full h-12 bg-[var(--canvas)] border border-[var(--surface-border)] text-base sm:text-sm rounded-xl pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] transition";
const labelClass = "text-sm font-bold text-[var(--text-secondary)]";
const primaryButtonClass =
  "w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60";

export function AuthModal({ isOpen, onClose, initialMode = "SIGN_IN" }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const isDirty = Boolean(email || password || confirmPassword);
  const dialogRef = useDialog<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setLoading(false);
    setGoogleLoading(false);
    setErrorMsg(null);
    setNeedsConfirmation(false);
    setResendNotice(null);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrorMsg(null);
    setNeedsConfirmation(false);
    setResendNotice(null);
  };

  const handleOAuthGoogle = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) {
      setErrorMsg(authErrorMessage(error));
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNeedsConfirmation(false);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setNeedsConfirmation(authErrorCode(error) === "email_not_confirmed");
      setErrorMsg(authErrorMessage(error));
      return;
    }
    onClose();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = signUpError(password, confirmPassword);
    if (invalid) {
      setErrorMsg(invalid);
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.href },
    });
    setLoading(false);
    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    // With email confirmation on, Supabase hides existing accounts by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      setErrorMsg(authErrorMessage({ code: "user_already_exists" }));
      return;
    }
    if (data.session) {
      onClose();
      return;
    }
    switchMode("VERIFY_NOTICE");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    switchMode("RESET_SENT");
  };

  const handleResend = async () => {
    setResendNotice(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.href },
    });
    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    setErrorMsg(null);
    setNeedsConfirmation(false);
    setResendNotice(`Verification email sent to ${email}.`);
  };

  const [title, subtitle] = HEADINGS[mode];
  const isSentScreen = mode === "VERIFY_NOTICE" || mode === "RESET_SENT";
  const passwordMismatch = mode === "SIGN_UP" && confirmPassword.length > 0 && confirmPassword !== password;

  const emailField = (id: string) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>Email</label>
      <div className="relative flex items-center">
        <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" aria-hidden="true" />
        <input
          id={id}
          name="email"
          type="email"
          autoComplete={mode === "SIGN_UP" ? "email" : "username email"}
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={inputClass}
        />
      </div>
    </div>
  );

  const passwordField = (id: string, label: string, value: string, onChange: (v: string) => void, autoComplete: string, invalid = false) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative flex items-center">
        <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={mode === "SIGN_UP" ? 6 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={id === "signup-password" ? "At least 6 characters" : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={`${inputClass} pr-12 ${invalid ? "border-[var(--danger)] focus:border-[var(--danger)]" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute right-0 w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {invalid && (
        <p id={`${id}-error`} className="text-xs font-semibold text-[var(--danger-text)]">
          Passwords don&apos;t match.
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={() => !isDirty && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-t-3xl sm:rounded-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 id="auth-title" className="font-extrabold text-xl text-[var(--text-primary)]">{title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
          </div>
          <IconButton
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 -mr-2 -mt-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {(mode === "SIGN_IN" || mode === "SIGN_UP") && (
          <div role="tablist" aria-label="Account" className="grid grid-cols-2 p-1 bg-[var(--canvas)] rounded-xl border border-[var(--surface-border)] gap-1">
            {(["SIGN_IN", "SIGN_UP"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`h-11 rounded-lg text-sm font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === m
                    ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {m === "SIGN_IN" ? <LogIn className="w-4 h-4" aria-hidden="true" /> : <UserCheck className="w-4 h-4" aria-hidden="true" />}
                {m === "SIGN_IN" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
        )}

        {errorMsg && (
          <Alert role="alert" className="p-3.5 bg-[var(--danger-subtle)] border border-[var(--danger-border)] rounded-xl flex items-start gap-2.5 text-sm text-[var(--danger-text)]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
            <div className="space-y-2">
              <span>{errorMsg}</span>
              {needsConfirmation && (
                <button type="button" onClick={handleResend} className="block font-extrabold underline cursor-pointer">
                  Resend Verification Email
                </button>
              )}
            </div>
          </Alert>
        )}

        {resendNotice && (
          <Alert role="status" className="p-3.5 bg-[var(--success-subtle)] border border-[var(--success-border)] rounded-xl flex items-center gap-2.5 text-sm text-[var(--success-text)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{resendNotice}</span>
          </Alert>
        )}

        {isSentScreen ? (
          <div className="text-center py-2 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--success-subtle)] border border-[var(--success-border)] text-[var(--success)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
              {mode === "VERIFY_NOTICE" ? "A verification link was sent to " : "A password reset link was sent to "}
              <span className="text-[var(--text-primary)] font-bold">{email}</span>. If it isn&apos;t in your inbox, check your spam folder.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => switchMode("SIGN_IN")} className={primaryButtonClass}>
                Back to Sign In
              </Button>
              {mode === "VERIFY_NOTICE" && (
                <Button
                  onClick={handleResend}
                  className="w-full h-12 bg-[var(--canvas)] text-[var(--text-primary)] text-sm rounded-xl transition font-bold border border-[var(--surface-border)] cursor-pointer"
                >
                  Resend Verification Email
                </Button>
              )}
            </div>
          </div>
        ) : mode === "FORGOT" ? (
          <form onSubmit={handleForgot} method="post" action="#" className="space-y-4">
            {emailField("forgot-email")}
            <Button type="submit" disabled={loading} className={primaryButtonClass}>
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              {loading ? "Sending Link..." : "Send Reset Link"}
            </Button>
            <button
              type="button"
              onClick={() => switchMode("SIGN_IN")}
              className="w-full h-11 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <>
            <Button
              onClick={handleOAuthGoogle}
              disabled={googleLoading}
              className="w-full h-12 bg-[var(--canvas)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-[var(--surface-border)] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {googleLoading ? "Opening Google..." : "Continue with Google"}
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--surface-border)] w-full" />
              <span className="bg-[var(--surface-card)] px-3 text-xs font-semibold text-[var(--text-secondary)] shrink-0">or use email</span>
            </div>

            {mode === "SIGN_IN" ? (
              <form onSubmit={handleSignIn} method="post" action="#" autoComplete="on" className="space-y-4">
                {emailField("login-email")}
                {passwordField("login-password", "Password", password, setPassword, "current-password")}
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => switchMode("FORGOT")}
                    className="h-11 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button type="submit" disabled={loading} className={primaryButtonClass}>
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} method="post" action="#" autoComplete="on" className="space-y-4">
                {emailField("signup-email")}
                {passwordField("signup-password", "Password", password, setPassword, "new-password")}
                {passwordField("signup-confirm-password", "Confirm Password", confirmPassword, setConfirmPassword, "new-password", passwordMismatch)}
                <p className="text-xs text-[var(--text-secondary)]">You&apos;ll choose your username and avatar after confirming your email.</p>
                <Button type="submit" disabled={loading || passwordMismatch} className={primaryButtonClass}>
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
