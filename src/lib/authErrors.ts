const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect. Try again, or reset your password.",
  email_not_confirmed: "Confirm your email first. Open the verification link we sent to your inbox.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  email_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "Choose a password with at least 6 characters.",
  same_password: "Choose a password that's different from your current one.",
  over_email_send_rate_limit: "Too many emails sent. Wait a minute, then try again.",
  over_request_rate_limit: "Too many attempts. Wait a minute, then try again.",
  reauthentication_needed: "For security, sign out and sign in again before changing your password.",
  session_not_found: "Your session has expired. Sign in again to continue.",
  otp_expired: "This link has expired. Request a new one.",
};

const MESSAGE_PATTERNS: [RegExp, string][] = [
  [/invalid login credentials/i, "invalid_credentials"],
  [/email not confirmed/i, "email_not_confirmed"],
  [/already registered|already exists/i, "user_already_exists"],
  [/password should be at least/i, "weak_password"],
  [/rate limit/i, "over_request_rate_limit"],
  [/auth session missing/i, "session_not_found"],
];

export function authErrorCode(err: unknown): string | null {
  const e = err as { code?: string; message?: string } | null;
  if (e?.code && MESSAGES[e.code]) return e.code;
  const match = MESSAGE_PATTERNS.find(([re]) => re.test(e?.message || ""));
  return match ? match[1] : null;
}

export function authErrorMessage(err: unknown): string {
  const code = authErrorCode(err);
  if (code) return MESSAGES[code];
  if (/failed to fetch|network/i.test((err as { message?: string })?.message || "")) {
    return "Unable to reach CineCircle. Check your connection and try again.";
  }
  return "Something went wrong. Try again in a moment.";
}

export const sanitizeUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_]/g, "");

export function signUpError(password: string, confirmPassword: string): string | null {
  if (password.length < 6) return "Choose a password with at least 6 characters.";
  if (password !== confirmPassword) return "Passwords don't match. Re-enter the same password in both fields.";
  return null;
}
