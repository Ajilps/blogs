export type PostStatus = "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  photoUrls: string[];
  audioUrl: string | null;
  youtubeUrl: string | null;
  tags: string[];
  status: PostStatus;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type PostSummary = Pick<
  Post,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImageUrl"
  | "tags"
  | "readTime"
  | "publishedAt"
>;

export type NewPostInput = {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  photoUrls?: string[];
  audioUrl?: string | null;
  youtubeUrl?: string | null;
  tags?: string[];
};
