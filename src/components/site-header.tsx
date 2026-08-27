import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header reading-shell">
      <Link className="brand" href="/" aria-label="Ajil's Notes home">
        <span className="brand-mark">A</span>
        <span>Ajil&apos;s Notes</span>
      </Link>
      <nav className="header-links" aria-label="Primary navigation">
        <Link href="/#stories">Stories</Link>
        <a href="https://ajil.cc/" target="_blank" rel="noreferrer">
          Portfolio <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
