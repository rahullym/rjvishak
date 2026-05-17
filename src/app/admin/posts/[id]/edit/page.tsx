import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) notFound();
    await dbConnect();
    const post = await Post.findById(id).lean();
    if (!post) notFound();

    return (
        <PostEditor
            initial={{
                _id: String(post._id),
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                tags: (post.tags || []).join(", "),
                author: post.author,
                published: post.published,
            }}
        />
    );
}
