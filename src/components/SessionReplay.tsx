"use client";

import { useEffect } from "react";
import { CONSENT_CHANGED_EVENT, CONSENT_KEY, readConsent } from "@/lib/consent";

const publicApiKey = process.env.NEXT_PUBLIC_RRWEB_PUBLIC_KEY;

export function SessionReplay() {
  useEffect(() => {
    if (!publicApiKey) return;
    let recording = false;

    const sync = async () => {
      const allowed = readConsent()?.sessionReplay === true;
      if (allowed === recording) return;
      recording = allowed;
      const rrweb = await import("@rrweb/browser-client");
      // Consent may have flipped again while the module was loading.
      if (recording !== allowed) return;
      if (allowed) {
        rrweb.start({
          publicApiKey,
          includePii: false,
          blockSelector: "[data-private]",
          maskTextSelector: "[data-mask]",
          maskAllInputs: true,
          meta: { environment: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ? "staging" : "production" },
        });
      } else {
        rrweb.stop(true);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) sync();
    };

    sync();
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
      if (recording) import("@rrweb/browser-client").then((rrweb) => rrweb.stop(false));
    };
  }, []);

  return null;
}
