import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="not-found reading-shell">
        <p className="kicker">404 · Missing page</p>
        <h1>This page slipped<br />between the leaves.</h1>
        <p>The story may have moved, or the address might be incomplete.</p>
        <Link className="primary-button" href="/">Return to the journal</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
