---
name: rrweb-cloud-browser-client
description: Installs rrweb Cloud session replay in a web app with the @rrweb/browser-client npm package (or CDN), gated behind explicit opt-in consent, with masking/blocking of sensitive UI and the cookie and privacy notice text the recording needs. Use when adding rrweb, rrweb Cloud, session replay, or session recording to a website, or when wiring a recorder to a cookie/consent banner.
---

# rrweb Cloud Browser Client

Source docs: [Browser Client](https://rrweb.com/docs/cloud/browser-client) and [Recording and privacy settings](https://rrweb.com/docs/cloud/recording-settings). Re-read them if the package major version has changed since `@rrweb/browser-client@2.2.0`.

The non-negotiable rule: **nothing is recorded until the visitor has opted in, and recording stops the moment they opt out.** Session replay captures what people see on screen, so it is never "essential" and must not be enabled by default or by a pre-ticked box.

## Step 0: Inspect the app

1. Find the existing consent/cookie banner (grep `cookie`, `consent`, `privacy`). Reuse it; only build a banner if none exists.
2. Find where consent is stored (localStorage key, cookie, CMP like OneTrust/Cookiebot/Piwik consent manager). The recorder must read from that same source.
3. List screens with personal or secret data: sign-in, sign-up, password reset, account/profile, payment, health, messages, admin. These get blocked.
4. Check for a Content Security Policy. With npm only `connect-src https://api.rrweb.com wss://api.rrweb.com` is needed; the CDN build also needs `script-src https://cdn.rrweb.com`.
5. Ask for the public API key (starts with `public_key_rr_`, from https://app.rrweb.com). It is write-only and safe in browser code. Put it in an env var (e.g. `NEXT_PUBLIC_RRWEB_PUBLIC_KEY`, `VITE_RRWEB_PUBLIC_KEY`); if it's empty, the recorder does nothing.

## Step 1: Install

```bash
npm install @rrweb/browser-client
```

Prefer npm over the CDN: it keeps a third-party host out of `script-src`. Use the CDN module (`https://cdn.rrweb.com/browser-client/current/browser-client.js`) only when there is no bundler, and still call `start()` manually after consent. Never use the UMD `autostart` attribute, because it records before consent.

## Step 2: Add a separate consent category

Add a **Session Replay** category to the consent UI, separate from analytics:

- Off by default in the "customize" view. "Reject"/"Essential only" turns it off.
- "Accept all" may turn it on **only if** the banner text itself says so (see notice text below).
- Treat older saved consent records without this field as **not consented**.
- Provide a persistent way to reopen the settings (e.g. a "Cookie settings" footer link) so people can withdraw consent.
- On save, broadcast a change (custom DOM event) so the recorder reacts without a reload.

## Step 3: Start and stop the recorder from consent

Rules from the rrweb privacy docs:

- Call `start()` only after consent. Load the module lazily (`import()`) so the code isn't fetched otherwise.
- On withdrawal call `stop(true)`: it stops capture and clears the stored recording ID so a later opt-in starts a fresh recording. Do not restart automatically.
- Keep `includePii: false` (the default). With it on, the client also sets a first-party cookie `rrweb-browser-client-visitor-id` for **366 days** and sends timezone, page title and referrer, all of which must then be disclosed in the notice.
- Never put emails, names, auth tokens or raw user input in `meta`, `addMeta()`, `addPageviewMeta()` or `addCustomEvent()` payloads. Use an opaque internal ID if anything.

React/Next.js client component (mount once in the root layout):

```tsx
"use client";
import { useEffect } from "react";

const publicApiKey = process.env.NEXT_PUBLIC_RRWEB_PUBLIC_KEY;
// Replace these with the app's real consent source.
const CONSENT_EVENT = "app:consent-changed";
const hasReplayConsent = () => {
  try { return JSON.parse(localStorage.getItem("app_consent") ?? "null")?.sessionReplay === true; }
  catch { return false; }
};

export function SessionReplay() {
  useEffect(() => {
    if (!publicApiKey) return;
    let recording = false;
    const sync = async () => {
      const allowed = hasReplayConsent();
      if (allowed === recording) return;
      recording = allowed;
      const rrweb = await import("@rrweb/browser-client");
      if (recording !== allowed) return; // consent flipped while loading
      if (allowed) {
        rrweb.start({
          publicApiKey,
          includePii: false,
          blockSelector: "[data-private]",
          maskTextSelector: "[data-mask]",
          maskAllInputs: true,
        });
      } else {
        rrweb.stop(true);
      }
    };
    const onStorage = (e: StorageEvent) => { if (e.key === "app_consent") sync(); };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", onStorage); // consent changed in another tab
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return null;
}
```

Plain JS / CDN equivalent:

```html
<script type="module">
  import { start, stop } from 'https://cdn.rrweb.com/browser-client/current/browser-client.js';
  const sync = () => hasReplayConsent()
    ? start({ publicApiKey: 'public_key_rr_…', includePii: false, blockSelector: '[data-private]', maskTextSelector: '[data-mask]' })
    : stop(true);
  if (hasReplayConsent()) sync();
  window.addEventListener('app:consent-changed', sync);
</script>
```

If the site uses a CMP, call the same `sync` from the CMP's consent-change callback instead of the custom event.

## Step 4: Mask and block sensitive UI

Defaults already applied by the Browser Client: `maskAllInputs: true` (every input, including passwords), `slimDOMOptions: 'all'`, `inlineStylesheet: true`. Canvas, cross-origin iframes, console and network capture are off. Keep them off unless there's a reviewed reason.

- Add `data-private` to the root element of every sensitive screen or dialog from Step 0. It removes the region's content and structure from the recording.
- Add `data-mask` to text that should keep its layout but hide its value (the signed-in user's email in a menu, order totals, addresses).
- The class names `rr-block` and `rr-mask` also work with no config.
- Don't pass `maskAllInputs: false`, `recordCanvas: true`, `inlineImages: true` or the console/network plugins without a privacy review.

## Step 5: Cookie and privacy notice text

Put a short line in the **banner** and a full description in the **settings panel**. Adapt to the app, but cover every point:

Banner (one sentence near "Accept all"):
> "Accept All" also turns on session replay: a recording of the pages you see and your clicks and scrolls, sent to rrweb Cloud to help us fix bugs. Typed text is masked and sign-in and account screens are never recorded. Change this anytime under "Cookie settings".

Settings panel, Session Replay category:

1. **What is recorded**: pages viewed (including any content shown, such as other users' names), clicks, scrolling, navigation.
2. **What is not recorded**: typed text (masked), the blocked screens by name, IP address and browser details (`includePii: false`).
3. **Who receives it**: rrweb Cloud as processor, endpoint `api.rrweb.com`.
4. **Storage used**: session storage key `rrweb-browser-client-recording-id` (per tab, cleared when the tab closes). No cookies with `includePii: false`; otherwise disclose `rrweb-browser-client-visitor-id` (first-party cookie, 366 days).
5. **Withdrawal**: turning it off stops recording immediately.
6. **Retention and deletion**: withdrawal doesn't delete recordings already sent; state the retention period and how to request deletion.

Also update the site's privacy policy page, if there is one, with the same points, and list rrweb as a sub-processor. Confirm a lawful basis and retention period with whoever owns privacy before enabling it in production.

## Step 6: Verify

1. `tsc --noEmit` and a production build pass.
2. In a fresh browser profile with the key set, open DevTools → Network, filter `rrweb`:
   - Before choosing anything, and after "Essential only": **no** requests to `api.rrweb.com` and no `rrweb-browser-client-recording-id` in session storage.
   - After opting in: a WebSocket to `wss://api.rrweb.com/recordings/<id>/events/ws` opens.
   - After opting out via "Cookie settings": the socket closes and the session storage key is removed.
3. Open the recording at https://app.rrweb.com/recordings and confirm blocked screens appear as placeholders, inputs are masked, and `data-mask` text is hidden. Test with fake data, not real accounts.
4. Check Application → Cookies: no `rrweb-browser-client-visitor-id` while `includePii` is false.
