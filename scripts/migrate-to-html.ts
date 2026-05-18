/**
 * One-time migration: convert any post whose `content` is markdown
 * (not yet HTML) into HTML, so the TipTap editor can load it cleanly.
 *
 * Detection: content that doesn't start with `<` is treated as markdown
 * and run through marked.parse().
 *
 * Idempotent — re-running on already-HTML content is a no-op.
 *
 * Usage:  npm run migrate:html
 */
import "dotenv/config";
import mongoose from "mongoose";
import { marked } from "marked";
import { Post } from "../src/models/Post";

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("✗ MONGODB_URI not set");
        process.exit(1);
    }
    await mongoose.connect(uri);

    const all = await Post.find().lean();
    let converted = 0;
    let skipped = 0;

    for (const p of all) {
        const c = (p.content || "").trim();
        if (c.startsWith("<")) {
            skipped++;
            console.log(`-  ${p.slug}  (already HTML)`);
            continue;
        }
        const html = marked.parse(c, { async: false }) as string;
        await Post.findByIdAndUpdate(p._id, { content: html });
        converted++;
        console.log(`✓  ${p.slug}  (markdown → HTML)`);
    }

    console.log(`\nConverted: ${converted}, Skipped: ${skipped}, Total: ${all.length}`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
