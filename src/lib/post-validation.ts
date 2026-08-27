import "server-only";

import { z } from "zod";
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

export const postSchema = z.object({
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
