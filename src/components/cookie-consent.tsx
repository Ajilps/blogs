"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "ajil-cookie-consent";
// Increment this whenever the optional cookie purposes materially change.
const CONSENT_VERSION = 1;
const CONSENT_EVENT = "ajil:cookie-consent-changed";
const OPEN_EVENT = "ajil:open-cookie-preferences";

export type CookieConsentChoice = "accepted" | "denied";
type CookieConsentState = CookieConsentChoice | "unknown" | null;

let memoryConsent: CookieConsentChoice | null = null;

function readConsent(): CookieConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (!value) return memoryConsent;

    // Preserve choices saved before consent records became versioned.
    if (value === "accepted" || value === "denied") {
      return CONSENT_VERSION === 1 ? value : null;
    }

    const record = JSON.parse(value) as { choice?: unknown; version?: unknown };
    if (
      record.version === CONSENT_VERSION &&
      (record.choice === "accepted" || record.choice === "denied")
    ) {
      return record.choice;
    }

    return null;
  } catch {
    return memoryConsent;
  }
}

function announceConsent(choice: CookieConsentChoice) {
  window.dispatchEvent(new CustomEvent<CookieConsentChoice>(CONSENT_EVENT, { detail: choice }));
}

export function useCookieConsent() {
  return useSyncExternalStore<CookieConsentState>(
    (notify) => {
      window.addEventListener(CONSENT_EVENT, notify);
      window.addEventListener("storage", notify);
      return () => {
        window.removeEventListener(CONSENT_EVENT, notify);
        window.removeEventListener("storage", notify);
      };
    },
    readConsent,
    () => "unknown",
  );
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookiePreferencesButton() {
  return (
    <button className="cookie-preferences-button" type="button" onClick={openCookiePreferences}>
      Cookie choices
    </button>
  );
}

export function CookieConsent() {
  const pathname = usePathname();
  const consent = useCookieConsent();
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    function open() {
      setForceOpen(true);
    }

    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  function choose(choice: CookieConsentChoice) {
    memoryConsent = choice;
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ choice, version: CONSENT_VERSION }),
      );
    } catch {
      // The preference remains active for this page even if storage is unavailable.
    }

    announceConsent(choice);
    setForceOpen(false);
  }

  if (
    pathname.startsWith("/admin") ||
    consent === "unknown" ||
    (!forceOpen && consent !== null)
  ) return null;

  return (
    <aside className="cookie-consent" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-copy">
        <p className="kicker">Your privacy</p>
        <h2 id="cookie-consent-title">Cookie choices</h2>
        <p>
          Ajil&apos;s Notes stores your theme and this choice locally. Optional cookies and
          third-party content are disabled unless you accept. Today, acceptance is used
          only to load YouTube videos; no advertising cookies are used. If those purposes
          change, you will be asked again. The private editor uses an essential secure
          sign-in cookie.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => choose("denied")}>Deny</button>
        <button className="cookie-accept" type="button" onClick={() => choose("accepted")}>
          Accept
        </button>
      </div>
    </aside>
  );
}
