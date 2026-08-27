import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer reading-shell">
      <p>© {new Date().getFullYear()} Ajil</p>
      <div>
        <a href="https://ajil.cc/" target="_blank" rel="noreferrer">
          ajil.cc ↗
        </a>
        <Link className="editor-link" href="/admin/login">
          Editor
        </Link>
      </div>
    </footer>
  );
}
