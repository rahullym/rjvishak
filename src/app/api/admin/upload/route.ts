import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
            {
                error:
                    "BLOB_READ_WRITE_TOKEN is not configured. In your Vercel project: Storage → Create → Blob → Connect, then redeploy. For local dev: `vercel env pull` to download the token to .env.",
            },
            { status: 500 }
        );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing 'file' in form data" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: `File exceeds 8MB limit` }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: `Type ${file.type} not allowed. Use JPEG, PNG, WebP, GIF, or SVG.` },
            { status: 415 }
        );
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const safeName = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(safeName, file, {
        access: "public",
        contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
