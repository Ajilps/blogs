import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { postSchema } from "@/lib/post-validation";
import { createPost } from "@/lib/posts";

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
