import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function PostCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  return (
    <article className="story-card">
      <Link className="story-card-link" href={`/blog/${post.slug}`}>
        <div className={`story-art story-art-${(index % 3) + 1}`}>
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 720px) 100vw, 50vw"
            />
          ) : (
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          )}
        </div>
        <div className="story-card-body">
          <p className="story-category">{post.tags[0] || "Notes"}</p>
          <h3>{post.title}</h3>
          <p className="story-excerpt">{post.excerpt}</p>
          <div className="story-meta">
            <time dateTime={post.publishedAt}>
              {formatter.format(new Date(post.publishedAt))}
            </time>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
