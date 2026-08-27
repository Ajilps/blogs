import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { postSchema } from "@/lib/post-validation";
import { updatePost } from "@/lib/posts";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/posts/[id]">,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "You are not authorized to edit this story." }, { status: 401 });
  }

  try {
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Check the post details." },
        { status: 400 },
      );
    }

    const { id } = await params;
    const post = await updatePost(id, parsed.data);
    if (!post) {
      return NextResponse.json({ error: "The story could not be found." }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to update post", error);
    return NextResponse.json(
      { error: "The story could not be updated. Please try again." },
      { status: 500 },
    );
  }
}
