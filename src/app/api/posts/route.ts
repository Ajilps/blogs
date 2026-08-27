import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { createPost } from "@/lib/posts";
import { getYouTubeId } from "@/lib/youtube";

function isBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".public.blob.vercel-storage.com") ||
        url.hostname.endsWith(".blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

const optionalBlobUrl = z
  .string()
  .url()
  .refine(isBlobUrl, "Media must come from the connected Vercel Blob store.")
  .nullable()
  .optional();

const postSchema = z.object({
  title: z.string().trim().min(3).max(140),
  excerpt: z.string().trim().min(12).max(420),
  content: z.string().trim().min(20).max(100000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  coverImageUrl: optionalBlobUrl,
  photoUrls: z
    .array(z.string().url().refine(isBlobUrl, "Photos must come from Vercel Blob."))
    .max(8)
    .default([]),
  audioUrl: optionalBlobUrl,
  youtubeUrl: z
    .string()
    .url()
    .refine((value) => Boolean(getYouTubeId(value)), "Enter a valid YouTube link.")
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "You are not authorized to publish." }, { status: 401 });
  }

  try {
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Check the post details." },
        { status: 400 },
      );
    }

    const post = await createPost(parsed.data);
    revalidatePath("/");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to publish post", error);
    return NextResponse.json(
      { error: "The story could not be published. Please try again." },
      { status: 500 },
    );
  }
}
