import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { adminIsConfigured, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="login-page">
      <div className="login-panel">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>Ajil&apos;s Notes</span>
        </Link>
        <div className="login-copy">
          <p className="kicker">Private editor</p>
          <h1>Welcome back,<br />Ajil.</h1>
          <p>Sign in to write and publish a new story.</p>
        </div>
        <LoginForm configured={adminIsConfigured()} />
        <Link className="back-link" href="/">← Return to the journal</Link>
      </div>
      <div className="login-art" aria-hidden="true">
        <span>Notes on<br />making things<br />that matter.</span>
        <i>01</i>
      </div>
    </main>
  );
}
