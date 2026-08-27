import Link from "next/link";
import { notFound } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { PostEditor } from "@/components/post-editor";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireAdmin } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: PageProps<"/admin/edit/[slug]">) {
  await requireAdmin();

  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>Ajil&apos;s Notes</span>
        </Link>
        <div className="admin-header-actions">
          <Link href="/admin">New story</Link>
          <Link href={`/blog/${post.slug}`}>View story ↗</Link>
          <ThemeToggle />
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <div className="admin-shell">
        <section className="editor-intro">
          <Link className="back-link" href="/admin">← Back to the editor</Link>
          <p className="kicker">Editing a published story</p>
          <h1>Refine the story.</h1>
          <p>The public URL and original publication date will stay the same.</p>
        </section>

        <PostEditor post={post} />
      </div>
    </main>
  );
}
