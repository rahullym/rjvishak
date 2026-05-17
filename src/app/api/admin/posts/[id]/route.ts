import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

async function requireAuth() {
    const session = await auth();
    if (!session?.user) return null;
    return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    await dbConnect();
    const current = await Post.findById(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.slug && body.slug !== current.slug) {
        const exists = await Post.findOne({ slug: body.slug, _id: { $ne: id } });
        if (exists) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const becamePublished = body.published === true && !current.published;

    const update: Record<string, unknown> = {
        title: body.title ?? current.title,
        slug: body.slug ?? current.slug,
        excerpt: body.excerpt ?? current.excerpt,
        content: body.content ?? current.content,
        coverImage: body.coverImage ?? current.coverImage,
        tags: Array.isArray(body.tags) ? body.tags : current.tags,
        author: body.author ?? current.author,
        published: body.published ?? current.published,
    };
    if (becamePublished) update.publishedAt = new Date();

    await Post.findByIdAndUpdate(id, update);
    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await dbConnect();
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
}
