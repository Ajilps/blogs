"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Post } from "@/lib/types";

type UploadKind = "cover" | "photo" | "audio";

function safeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-100);
}

async function uploadMedia(file: File, kind: UploadKind) {
  const folder = kind === "audio" ? "audio" : "images";
  const pathname = `blog/${folder}/${Date.now()}-${safeFilename(file.name)}`;
  return upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    multipart: file.size > 5 * 1024 * 1024,
    clientPayload: kind,
  });
}

type EditablePost = Pick<
  Post,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "tags"
  | "coverImageUrl"
  | "photoUrls"
  | "audioUrl"
  | "youtubeUrl"
>;

export function PostEditor({ post }: { post?: EditablePost }) {
  const router = useRouter();
  const isEditing = Boolean(post);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setStatus("Preparing your story…");

    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      const cover = data.get("cover") as File | null;
      const photos = data
        .getAll("photos")
        .filter((value): value is File => value instanceof File && value.size > 0)
        .slice(0, 8);
      const audio = data.get("audio") as File | null;
      const existingPhotos = data.get("removePhotos") === "on" ? [] : (post?.photoUrls ?? []);

      if (existingPhotos.length + photos.length > 8) {
        throw new Error("A story can have up to eight photos. Remove the existing set or select fewer files.");
      }

      setStatus("Uploading media…");
      const [coverBlob, photoBlobs, audioBlob] = await Promise.all([
        cover && cover.size > 0 ? uploadMedia(cover, "cover") : null,
        Promise.all(photos.map((photo) => uploadMedia(photo, "photo"))),
        audio && audio.size > 0 ? uploadMedia(audio, "audio") : null,
      ]);

      const photoUrls = [...existingPhotos, ...photoBlobs.map((blob) => blob.url)];

      setStatus(isEditing ? "Saving your changes…" : "Publishing your story…");
      const response = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          excerpt: data.get("excerpt"),
          content: data.get("content"),
          tags: String(data.get("tags") || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          youtubeUrl: data.get("youtubeUrl") || null,
          coverImageUrl:
            coverBlob?.url ||
            (data.get("removeCover") === "on" ? null : post?.coverImageUrl) ||
            null,
          photoUrls,
          audioUrl:
            audioBlob?.url ||
            (data.get("removeAudio") === "on" ? null : post?.audioUrl) ||
            null,
        }),
      });

      const result = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok || !result.slug) {
        throw new Error(
          result.error || (isEditing ? "The story could not be updated." : "The story could not be published."),
        );
      }

      setStatus(isEditing ? "Changes saved. Opening the story…" : "Published. Opening the story…");
      if (!isEditing) form.reset();
      router.push(`/blog/${result.slug}`);
      router.refresh();
    } catch (caught) {
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={submit}>
      <div className="editor-section">
        <div className="editor-section-heading">
          <span>01</span>
          <div>
            <h2>The story</h2>
            <p>Give readers a clear promise, then deliver on it.</p>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            maxLength={140}
            required
            defaultValue={post?.title}
            placeholder="A title worth opening"
          />
        </div>
        <div className="field-group">
          <label htmlFor="excerpt">Short introduction</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            maxLength={420}
            required
            defaultValue={post?.excerpt}
            placeholder="One or two sentences that tell the reader why this matters."
          />
        </div>
        <div className="field-group">
          <label htmlFor="content">Article</label>
          <textarea
            id="content"
            name="content"
            className="article-input"
            rows={18}
            maxLength={100000}
            required
            defaultValue={post?.content}
            placeholder={"Write in Markdown.\n\n## A section heading\n\nUse **bold**, lists, links, and blockquotes to shape the reading experience."}
          />
          <p className="field-help">Markdown is supported. Raw HTML is intentionally not rendered.</p>
        </div>
        <div className="field-group">
          <label htmlFor="tags">Topics</label>
          <input
            id="tags"
            name="tags"
            maxLength={220}
            defaultValue={post?.tags.join(", ")}
            placeholder="engineering, design, notes"
          />
          <p className="field-help">Separate topics with commas. They help select related stories.</p>
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-section-heading">
          <span>02</span>
          <div>
            <h2>Media</h2>
            <p>Add only what helps the story breathe or makes an idea clearer.</p>
          </div>
        </div>

        <div className="media-field-grid">
          <div className="file-field">
            <label htmlFor="cover">Cover photo</label>
            <input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
            <p>{post?.coverImageUrl ? "Choose a file to replace the current cover." : "JPG, PNG, WebP or GIF. Up to 15 MB."}</p>
            {post?.coverImageUrl && (
              <div className="existing-media">
                <a href={post.coverImageUrl} target="_blank" rel="noreferrer">View current cover ↗</a>
                <label><input name="removeCover" type="checkbox" /> Remove current cover</label>
              </div>
            )}
          </div>
          <div className="file-field">
            <label htmlFor="photos">Photo set</label>
            <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
            <p>{post?.photoUrls.length ? `Add to the ${post.photoUrls.length} current photo${post.photoUrls.length === 1 ? "" : "s"}, up to eight total.` : "Up to eight additional photos."}</p>
            {post && post.photoUrls.length > 0 && (
              <div className="existing-media">
                <span>{post.photoUrls.length} current photo{post.photoUrls.length === 1 ? "" : "s"}</span>
                <label><input name="removePhotos" type="checkbox" /> Remove existing photo set</label>
              </div>
            )}
          </div>
          <div className="file-field">
            <label htmlFor="audio">Audio</label>
            <input id="audio" name="audio" type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm" />
            <p>{post?.audioUrl ? "Choose a file to replace the current audio." : "MP3, M4A, WAV, OGG or WebM. Up to 100 MB."}</p>
            {post?.audioUrl && (
              <div className="existing-media">
                <a href={post.audioUrl} target="_blank" rel="noreferrer">Listen to current audio ↗</a>
                <label><input name="removeAudio" type="checkbox" /> Remove current audio</label>
              </div>
            )}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="youtubeUrl">YouTube video</label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            defaultValue={post?.youtubeUrl || ""}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <p className="field-help">Standard, short, Shorts, and embed links are accepted.</p>
        </div>
      </div>

      {error && <p className="form-message form-error">{error}</p>}
      {status && <p className="form-message form-success">{status}</p>}
      <button className="primary-button publish-button" type="submit" disabled={pending}>
        {pending ? "Working…" : isEditing ? "Save changes" : "Publish story"}
      </button>
    </form>
  );
}
