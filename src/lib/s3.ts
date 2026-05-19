import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

export function getS3Client(): S3Client {
    if (cached) return cached;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error("AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY must be set");
    }
    cached = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    return cached;
}

export interface UploadResult {
    key: string;
    url: string;
}

export async function uploadToS3(
    file: File,
    keyPrefix: string = "posts"
): Promise<UploadResult> {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error("AWS_S3_BUCKET is not set");

    const region = process.env.AWS_REGION!;
    const cdnBase = (process.env.AWS_S3_PUBLIC_URL || "").replace(/\/$/, "");

    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${keyPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const body = Buffer.from(await file.arrayBuffer());

    const s3 = getS3Client();
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: file.type || "application/octet-stream",
            CacheControl: "public, max-age=31536000, immutable",
        })
    );

    const url = cdnBase
        ? `${cdnBase}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { key, url };
}
