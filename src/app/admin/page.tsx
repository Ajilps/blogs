import Link from "next/link";
import { PostEditor } from "@/components/post-editor";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getPublishedPosts } from "@/lib/posts";
import type { PostSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  let posts: PostSummary[] = [];
  try {
    posts = await getPublishedPosts(12);
  } catch (error) {
    console.error("Failed to load admin post list", error);
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>Ajil&apos;s Notes</span>
        </Link>
        <div className="admin-header-actions">
          <Link href="/">View site ↗</Link>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <div className="admin-shell">
        <section className="editor-intro">
          <p className="kicker">The editor&apos;s desk</p>
          <h1>Publish a new story.</h1>
          <p>Words first. Media when it earns its place.</p>
        </section>

        <PostEditor />

        <section className="published-list" aria-labelledby="published-title">
          <div className="editor-section-heading">
            <span>03</span>
            <div>
              <h2 id="published-title">Recently published</h2>
              <p>A quick path back to your latest work.</p>
            </div>
          </div>
          {posts.length ? (
            <div className="published-rows">
              {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <span>{post.tags[0] || "Notes"}</span>
                  <strong>{post.title}</strong>
                  <i aria-hidden="true">↗</i>
                </Link>
              ))}
            </div>
          ) : (
            <p className="admin-empty">Your published stories will appear here.</p>
          )}
        </section>
      </div>
    </main>
  );
}
