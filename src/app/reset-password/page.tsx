"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Sparkles } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Listen for auth state change recovery event or active session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsReady(true);
      }
    });

    // Check if session already active from recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      } else {
        // Allow user a moment to verify link token in URL hash
        setTimeout(() => setIsReady(true), 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setErrorMsg(err.message || "Failed to update password. Your reset link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Logo */}
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shadow group-hover:scale-105 transition relative flex items-center justify-center bg-[var(--surface-card)]">
            <Image
              src="/logo.png"
              alt="CineCircle Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-lg font-black text-[var(--text-primary)] tracking-tight">
            CineCircle
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to App
        </button>
      </header>

      {/* Main Center Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Icon */}
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center mx-auto shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter and confirm your new CineCircle account password
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in py-4">
              <div className="w-14 h-14 rounded-full bg-[var(--success-subtle)] text-[var(--success)] flex items-center justify-center mx-auto border border-[var(--success-border)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                  Password Updated Successfully!
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your new password is now active. You are automatically signed in to your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" /> Return to CineCircle
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 bg-[var(--danger-subtle)] border border-[var(--danger-border)] rounded-2xl flex items-center gap-2.5 text-xs text-[var(--danger-text)] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-11 bg-[var(--canvas)] border border-[var(--surface-border)] text-xs rounded-xl pl-10 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? "Updating Password..." : "Save New Password"}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[var(--text-muted)] py-4">
        CineCircle • Secure Authentication Powered by Supabase
      </footer>
    </div>
  );
}
