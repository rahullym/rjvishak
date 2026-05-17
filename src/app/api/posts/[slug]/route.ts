import { NextResponse } from "next/server";
import { marked } from "marked";
import { dbConnect } from "@/lib/mongoose";
import { Post, type PostDoc } from "@/models/Post";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await dbConnect();
    const post = await Post.findOne({ slug, published: true }).lean<PostDoc>();
    if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders() });
    }

    return NextResponse.json(
        {
            id: String(post._id),
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            contentHtml: marked.parse(post.content, { async: false }) as string,
            coverImage: post.coverImage,
            tags: post.tags,
            author: post.author,
            publishedAt: post.publishedAt || post.createdAt,
            updatedAt: post.updatedAt,
        },
        { headers: corsHeaders() }
    );
}
