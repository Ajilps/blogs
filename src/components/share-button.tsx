"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  excerpt: string;
};

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy failed");
}

export function ShareButton({ title, excerpt }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: excerpt, url });
        setMessage("Shared");
      } else {
        await copyToClipboard(url);
        setMessage("Link copied");
      }

      window.setTimeout(() => setMessage(""), 2600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Could not share");
      window.setTimeout(() => setMessage(""), 2600);
    }
  }

  return (
    <div className="share-control">
      <button type="button" onClick={share} aria-label={`Share ${title}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V3m0 0 5 5m-5-5L7 8M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        <span>{message || "Share story"}</span>
      </button>
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  );
}
