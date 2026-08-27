import "server-only";

import { cache } from "react";
import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { NewPostInput, Post, PostSummary, UpdatePostInput } from "@/lib/types";
import { normalizeYouTubeUrl } from "@/lib/youtube";

type PostDocument = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  photoUrls: string[];
  audioUrl: string | null;
  youtubeUrl: string | null;
  tags: string[];
  status: "published";
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
};

let indexPromise: Promise<unknown> | undefined;

async function getPostsCollection(): Promise<Collection<PostDocument>> {
  const collection = (await getDatabase()).collection<PostDocument>("posts");

  indexPromise ??= Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ status: 1, publishedAt: -1 }),
    collection.createIndex({ tags: 1 }),
  ]);
  await indexPromise;

  return collection;
}

function toPost(document: WithId<PostDocument>): Post {
  return {
    id: document._id.toHexString(),
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt,
    content: document.content,
    coverImageUrl: document.coverImageUrl,
    photoUrls: document.photoUrls,
    audioUrl: document.audioUrl,
    youtubeUrl: document.youtubeUrl,
    tags: document.tags,
    status: document.status,
    readTime: document.readTime,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    publishedAt: document.publishedAt.toISOString(),
  };
}

function toSummary(document: WithId<PostDocument>): PostSummary {
  const post = toPost(document);
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    tags: post.tags,
    readTime: post.readTime,
    publishedAt: post.publishedAt,
  };
}

function slugify(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "story"
  );
}

async function createUniqueSlug(collection: Collection<PostDocument>, title: string) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (await collection.findOne({ slug }, { projection: { _id: 1 } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

export async function getPublishedPosts(limit = 24): Promise<PostSummary[]> {
  const collection = await getPostsCollection();
  const documents = await collection
    .find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .toArray();

  return documents.map(toSummary);
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const collection = await getPostsCollection();
  const document = await collection.findOne({ slug, status: "published" });
  return document ? toPost(document) : null;
});

export async function getSuggestedPosts(post: Post, limit = 3) {
  const collection = await getPostsCollection();
  const related = post.tags.length
    ? await collection
        .find({
          status: "published",
          slug: { $ne: post.slug },
          tags: { $in: post.tags },
        })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .toArray()
    : [];

  if (related.length >= limit) return related.map(toSummary);

  const existingSlugs = [post.slug, ...related.map((item) => item.slug)];
  const more = await collection
    .find({ status: "published", slug: { $nin: existingSlugs } })
    .sort({ publishedAt: -1 })
    .limit(limit - related.length)
    .toArray();

  return [...related, ...more].map(toSummary);
}

export async function createPost(input: NewPostInput) {
  const collection = await getPostsCollection();
  const now = new Date();
  const slug = await createUniqueSlug(collection, input.title);

  const document: PostDocument = {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    coverImageUrl: input.coverImageUrl || null,
    photoUrls: input.photoUrls || [],
    audioUrl: input.audioUrl || null,
    youtubeUrl: normalizeYouTubeUrl(input.youtubeUrl),
    tags: Array.from(
      new Set((input.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
    ),
    status: "published",
    readTime: estimateReadTime(input.content),
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  const result = await collection.insertOne(document);
  return { slug, id: result.insertedId.toHexString() };
}

export async function updatePost(id: string, input: UpdatePostInput) {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getPostsCollection();
  const objectId = new ObjectId(id);
  const existing = await collection.findOne(
    { _id: objectId, status: "published" },
    { projection: { slug: 1 } },
  );

  if (!existing) return null;

  await collection.updateOne(
    { _id: objectId, status: "published" },
    {
      $set: {
        title: input.title.trim(),
        excerpt: input.excerpt.trim(),
        content: input.content.trim(),
        coverImageUrl: input.coverImageUrl || null,
        photoUrls: input.photoUrls || [],
        audioUrl: input.audioUrl || null,
        youtubeUrl: normalizeYouTubeUrl(input.youtubeUrl),
        tags: Array.from(
          new Set((input.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
        ),
        readTime: estimateReadTime(input.content),
        updatedAt: new Date(),
      },
    },
  );

  return { id, slug: existing.slug };
}
