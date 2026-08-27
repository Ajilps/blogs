const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeId(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const id =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : parts[0] === "embed" || parts[0] === "shorts"
            ? parts[1]
            : null;

      return id && YOUTUBE_ID.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeYouTubeUrl(value: string | null | undefined) {
  const id = getYouTubeId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function getYouTubeEmbedUrl(value: string | null | undefined) {
  const id = getYouTubeId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
