import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    try {
        const { url, key } = await uploadToS3(file, "posts");
        return NextResponse.json({ url, pathname: key });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        console.error("[upload] S3 error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
