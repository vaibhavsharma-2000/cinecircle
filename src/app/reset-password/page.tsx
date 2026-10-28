"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authErrorMessage, signUpError } from "@/lib/authErrors";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [linkState, setLinkState] = useState<"CHECKING" | "VALID" | "INVALID">("CHECKING");

  useEffect(() => {
    // The recovery token in the URL is exchanged for a session; if none appears, the link is bad or expired.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setLinkState("VALID");
    });
    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setLinkState(session ? "VALID" : "INVALID");
    }, 2000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = signUpError(password, confirmPassword);
    if (invalid) {
      setErrorMsg(invalid);
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    setIsSuccess(true);
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
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)] shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="CineCircle Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black text-[var(--text)] tracking-tight">
            CineCircle
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="min-h-11 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to CineCircle
        </button>
      </header>

      {/* Main Center Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-accent)] text-[var(--brand-accent-text)] flex items-center justify-center mx-auto shadow-md">
              <KeyRound className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {linkState === "INVALID" && !isSuccess ? "Link Expired" : "Choose a New Password"}
            </h1>
          </div>

          {isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in py-2" role="status">
              <div className="w-14 h-14 rounded-full bg-[var(--success-subtle)] text-[var(--success)] flex items-center justify-center mx-auto border border-[var(--success-border)]">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">Password updated. You&apos;re signed in.</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to CineCircle
              </button>
            </div>
          ) : linkState === "CHECKING" ? (
            <p className="text-sm text-center text-[var(--text-secondary)] py-6" role="status">Checking link...</p>
          ) : linkState === "INVALID" ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                This reset link is invalid or has expired. Request a new one to continue.
              </p>
              <button
                type="button"
                onClick={() => router.push("/?auth=forgot")}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer"
              >
                Request New Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} method="post" action="#" className="space-y-4">
              {errorMsg && (
                <div role="alert" className="p-3.5 bg-[var(--danger-subtle)] border border-[var(--danger-border)] rounded-2xl flex items-center gap-2.5 text-sm text-[var(--danger-text)] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {[
                { id: "reset-password", label: "New Password", value: password, set: setPassword, placeholder: "At least 6 characters" },
                { id: "reset-confirm-password", label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, placeholder: undefined },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label htmlFor={f.id} className="text-sm font-bold text-[var(--text-secondary)]">{f.label}</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 pointer-events-none" aria-hidden="true" />
                    <input
                      id={f.id}
                      name={f.id}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full h-12 bg-[var(--canvas)] border border-[var(--surface-border)] text-base sm:text-sm rounded-xl pl-10 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] transition"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-accent-text)] font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? "Saving..." : "Save New Password"}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--text-muted)] py-4">
        CineCircle • Secure Authentication Powered by Supabase
      </footer>
    </div>
  );
}
