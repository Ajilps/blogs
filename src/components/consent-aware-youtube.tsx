"use client";

import { openCookiePreferences, useCookieConsent } from "@/components/cookie-consent";

export function ConsentAwareYouTube({
  embedUrl,
  title,
}: {
  embedUrl: string;
  title: string;
}) {
  const consent = useCookieConsent();

  if (consent === "accepted") {
    return (
      <section className="video-block" aria-label="Video">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </section>
    );
  }

  return (
    <section className="video-consent-card" aria-label="Video privacy notice">
      <p className="media-label">Optional video</p>
      <h2>Video is paused for privacy.</h2>
      <p>Accept optional content to load this YouTube video.</p>
      <button type="button" onClick={openCookiePreferences}>Review cookie choices</button>
    </section>
  );
}
