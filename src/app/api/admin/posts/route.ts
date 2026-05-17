import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.title || !body.slug || !body.content) {
        return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
    }

    await dbConnect();
    const exists = await Post.findOne({ slug: body.slug });
    if (exists) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

    const doc = await Post.create({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || "",
        content: body.content,
        coverImage: body.coverImage || "",
        tags: Array.isArray(body.tags) ? body.tags : [],
        author: body.author || "Visakh RJ",
        published: !!body.published,
        publishedAt: body.published ? new Date() : undefined,
    });

    return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
