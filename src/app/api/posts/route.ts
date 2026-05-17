import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
    await dbConnect();
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
    const tag = url.searchParams.get("tag");
    const includeHtml = url.searchParams.get("html") === "1";

    const query: Record<string, unknown> = { published: true };
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
        .lean();

    const data = posts.map((p) => ({
        id: String(p._id),
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        tags: p.tags,
        author: p.author,
        publishedAt: p.publishedAt || p.createdAt,
        updatedAt: p.updatedAt,
        contentHtml: includeHtml ? (marked.parse(p.content, { async: false }) as string) : undefined,
    }));

    return NextResponse.json({ posts: data }, { headers: corsHeaders() });
}
