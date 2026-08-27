import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/markdown-article";
import { ConsentAwareYouTube } from "@/components/consent-aware-youtube";
import { PostCard } from "@/components/post-card";
import { ShareButton } from "@/components/share-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPostBySlug, getSuggestedPosts } from "@/lib/posts";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const formatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Story not found" };

  const images = post.coverImageUrl ? [post.coverImageUrl] : [];
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [suggestions, youtubeEmbedUrl] = await Promise.all([
    getSuggestedPosts(post),
    Promise.resolve(getYouTubeEmbedUrl(post.youtubeUrl)),
  ]);

  return (
    <main>
      <SiteHeader />

      <article>
        <header className="article-header article-shell">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> All stories
          </Link>
          <div className="article-tags">
            {post.tags.length ? post.tags.map((tag) => <span key={tag}>{tag}</span>) : <span>Notes</span>}
          </div>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-meta">
            <span>By Ajil</span>
            <time dateTime={post.publishedAt}>{formatter.format(new Date(post.publishedAt))}</time>
            <span>{post.readTime} min read</span>
          </div>
          <ShareButton title={post.title} excerpt={post.excerpt} />
        </header>

        {post.coverImageUrl && (
          <div className="article-cover wide-shell">
            <Image
              src={post.coverImageUrl}
              alt={`Cover for ${post.title}`}
              fill
              priority
              sizes="(max-width: 1240px) 100vw, 1240px"
            />
          </div>
        )}

        <div className="article-body article-shell">
          <MarkdownArticle content={post.content} />

          {post.photoUrls.length > 0 && (
            <section className="photo-essay" aria-label="Photos from this story">
              {post.photoUrls.map((url, index) => (
                <figure key={url}>
                  <div className="photo-frame">
                    <Image
                      src={url}
                      alt={`Photo ${index + 1} from ${post.title}`}
                      fill
                      sizes="(max-width: 760px) 100vw, 760px"
                    />
                  </div>
                  <figcaption>Plate {String(index + 1).padStart(2, "0")}</figcaption>
                </figure>
              ))}
            </section>
          )}

          {post.audioUrl && (
            <section className="audio-card" aria-labelledby="audio-title">
              <p className="media-label">Listen</p>
              <h2 id="audio-title">Audio companion</h2>
              <audio controls preload="none" src={post.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </section>
          )}

          {youtubeEmbedUrl && (
            <ConsentAwareYouTube
              embedUrl={youtubeEmbedUrl}
              title={`Video for ${post.title}`}
            />
          )}

          <div className="article-signoff">
            <span aria-hidden="true">A</span>
            <p>Thanks for reading.</p>
            <a href="https://ajil.cc/" target="_blank" rel="noreferrer">More about Ajil ↗</a>
          </div>
        </div>
      </article>

      {suggestions.length > 0 && (
        <section className="suggestions wide-shell" aria-labelledby="suggestions-title">
          <div className="section-title-row">
            <div>
              <p className="section-index">Continue</p>
              <h2 id="suggestions-title">Keep reading</h2>
            </div>
            <Link className="all-stories-link" href="/#stories">All stories →</Link>
          </div>
          <div className="suggestion-grid">
            {suggestions.map((suggestion, index) => (
              <PostCard post={suggestion} index={index} key={suggestion.id} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
