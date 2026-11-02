export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  sessionReplay: boolean;
}

export const CONSENT_KEY = "cinecircle_cookie_consent";
export const CONSENT_CHANGED_EVENT = "cinecircle:consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "cinecircle:open-cookie-settings";

export function readConsent(): CookiePreferences | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    if (!parsed) return null;
    return {
      essential: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      sessionReplay: parsed.sessionReplay === true,
    };
  } catch {
    return null;
  }
}
