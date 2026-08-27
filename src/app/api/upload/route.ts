import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const imageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const audioContentTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    if (body.type === "blob.generate-client-token" && !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized upload request." }, { status: 401 });
    }

    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await isAdmin())) throw new Error("Unauthorized upload request.");

        const isAudio = clientPayload === "audio" || pathname.includes("/audio/");
        const hasValidPath = isAudio
          ? pathname.startsWith("blog/audio/")
          : pathname.startsWith("blog/images/");
        if (!hasValidPath) throw new Error("Invalid media path.");

        return {
          allowedContentTypes: isAudio ? audioContentTypes : imageContentTypes,
          maximumSizeInBytes: isAudio ? 100 * 1024 * 1024 : 15 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
