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

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2600);
  }

  async function copyUrl() {
    try {
      await copyToClipboard(window.location.href);
      showMessage("Link copied");
    } catch {
      showMessage("Could not copy the link");
    }
  }

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: excerpt, url });
        showMessage("Shared");
      } else {
        await copyUrl();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showMessage("Could not share");
    }
  }

  return (
    <div className="share-control">
      <button type="button" onClick={share} aria-label={`Share ${title}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V3m0 0 5 5m-5-5L7 8M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        <span>Share story</span>
      </button>
      <button type="button" onClick={copyUrl} aria-label={`Copy the link to ${title}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 15l6-6m-8.5 9.5-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m8-5.5 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" />
        </svg>
        <span>{message === "Link copied" ? "Copied" : "Copy URL"}</span>
      </button>
      <span className="share-message" aria-live="polite">{message}</span>
    </div>
  );
}
