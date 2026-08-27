import Link from "next/link";
import { CookiePreferencesButton } from "@/components/cookie-consent";

export function SiteFooter() {
  return (
    <footer className="site-footer reading-shell">
      <p>© {new Date().getFullYear()} Ajil</p>
      <div>
        <a href="https://ajil.cc/" target="_blank" rel="noreferrer">
          ajil.cc ↗
        </a>
        <CookiePreferencesButton />
        <Link className="editor-link" href="/admin/login">
          Editor
        </Link>
      </div>
    </footer>
  );
}
