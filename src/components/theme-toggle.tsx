"use client";

import { useLayoutEffect } from "react";

type Theme = "dark" | "light";

function savedTheme(): Theme {
  return localStorage.getItem("ajil-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#121512" : "#f3efe6",
  );
}

export function ThemeToggle() {
  useLayoutEffect(() => {
    applyTheme(savedTheme());
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("ajil-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Change color theme"
      title="Change color theme"
    >
      <span className="theme-icon theme-icon-sun" aria-hidden="true">☼</span>
      <span className="theme-icon theme-icon-moon" aria-hidden="true">◐</span>
      <span className="sr-only">Switch between dark and light themes</span>
    </button>
  );
}
