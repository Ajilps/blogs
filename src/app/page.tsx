import { connection } from "next/server";
import { PostCard } from "@/components/post-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedPosts } from "@/lib/posts";
import type { PostSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connection();

  let posts: PostSummary[] = [];
  let unavailable = false;

  try {
    posts = await getPublishedPosts();
  } catch (error) {
    unavailable = true;
    console.error("Failed to load published posts", error);
  }

  return (
    <main>
      <SiteHeader />

      <section className="home-hero reading-shell" id="top">
        <p className="kicker">Essays · Tutorials · Field notes</p>
        <h1>Writing for people<br />who like to look closer.</h1>
        <p className="hero-intro">
          Thoughtful notes on software, design, and the useful ideas found
          between them. Written slowly, published when ready.
        </p>
      </section>

      <section className="stories-section reading-shell" id="stories">
        <div className="section-title-row">
          <div>
            <p className="section-index">No. 01</p>
            <h2>Latest stories</h2>
          </div>
          <p className="section-note">Fresh from the notebook</p>
        </div>

        {posts.length > 0 ? (
          <div className="story-grid">
            {posts.map((post, index) => (
              <PostCard post={post} index={index} key={post.id} />
            ))}
          </div>
        ) : (
          <div className="empty-stories">
            <p className="empty-mark" aria-hidden="true">A</p>
            <div>
              <h3>{unavailable ? "The notebook is briefly unavailable." : "The first story is being written."}</h3>
              <p>
                {unavailable
                  ? "Please return in a little while."
                  : "New essays, tutorials, and field notes will appear here."}
              </p>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
