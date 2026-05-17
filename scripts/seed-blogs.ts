/**
 * Seed the existing 5 blog posts from the Astro site into the CMS.
 *
 * Idempotent — upserts by slug, so re-running won't duplicate.
 *
 * Usage:  npm run seed:blogs
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Post } from "../src/models/Post";

interface SeedPost {
    slug: string;
    title: string;
    excerpt: string;
    tags: string[];
    publishedAt: string;
    coverImage: string;
    content: string;
}

const posts: SeedPost[] = [
    {
        slug: "mind-over-management",
        title: "Mind Over Management: The Psychology of Professional Authority",
        excerpt: "True authority isn't granted by a title; it's commanded through psychological presence — the kind that shifts cultures and rescues failing projects.",
        tags: ["Leadership"],
        publishedAt: "2026-03-15",
        coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
        content: `In the high-stakes world of project leadership, authority is often mistaken for volume. We assume that the person speaking the loudest, or the one with the most impressive title, holds the room. But true professional authority — the kind that shifts cultures and rescues failing projects — is psychological.

### The Power of Stillness

Authority is commanded through presence, not demanded through hierarchy. When we look at leaders who maintain a "human calmness" in the face of crisis, we see a specific psychological trait: the ability to decouple their internal state from external chaos.

> True authority isn't granted by a title; it's commanded through psychological presence.

### Commanding the Room

To lead with stillness, one must first master their own emotional landscape. This isn't about suppression; it's about alchemy. Converting the pressure of a deadline into the focus of a strategical move.
`,
    },
    {
        slug: "why-90-percent-projects-fail",
        title: "Why 90% of Projects Fail (And How to Be the 10%)",
        excerpt: "Most initiatives fail not because of technical incompetence, but because of structural disconnects between high-level strategy and ground-level execution.",
        tags: ["Strategy"],
        publishedAt: "2026-03-10",
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        content: `Statistics in project management can be grim. Most initiatives fail not because of technical incompetence, but because of structural disconnects between high-level strategy and ground-level execution.

### The Execution Gap

The gap between what a CEO envisions and what a Project Manager delivers is often where ROI goes to die. To bridge this, we need a new kind of governance — one that prioritizes common sense over complex codes.
`,
    },
    {
        slug: "ai-revolution-common-sense",
        title: "The AI Revolution: Common Sense Over Codes",
        excerpt: "As AI automates the administrative side of project management, the PMP role shifts from tracking tasks to architecting intuition.",
        tags: ["Technology"],
        publishedAt: "2026-03-05",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        content: `As AI begins to automate the administrative side of project management, the role of the PMP is undergoing a radical shift. We are moving away from being "trackers of tasks" to being "architects of intuition."

### Human-Centric Tech

AI can calculate risks based on historical data, but it cannot navigate the sensitive political landscape of a boardroom. It can optimize a schedule, but it cannot inspire a tired team. The future belongs to those who use AI as a tool, but lead with human instinct.
`,
    },
    {
        slug: "leadership-vs-administration",
        title: "Leadership vs Administration: Decoding Calmness",
        excerpt: "What differentiates a manager from a leader? The ability to remain humanly calm while maintaining professional authority.",
        tags: ["Growth"],
        publishedAt: "2026-02-28",
        coverImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
        content: `What differentiates a manager from a leader? It's the ability to remain humanly calm while maintaining a professional authority. Modern corporate systems often reward administration — the tracking of things — over leadership — the moving of people.

### The Calm Leader

When crisis hits, the administrator looks for who to blame or what process failed. The leader looks for how to stabilize the team and find the path forward through the fog.
`,
    },
    {
        slug: "strategic-networking-pmp",
        title: "Strategic Networking for the Modern PMP",
        excerpt: "Networking isn't about collecting business cards — it's about building an ecosystem of elite influence and risk mitigation.",
        tags: ["Career"],
        publishedAt: "2026-02-20",
        coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
        content: `Networking isn't about collecting business cards; it's about building an ecosystem of elite influence. For the modern Project Management Professional, your network is your most valuable risk mitigation tool.

### Elite Influence

Master the art of high-level connection by focusing on value-first interactions. It's not about what you can get, but what authority you can bring to the table.
`,
    },
];

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("✗ MONGODB_URI not set");
        process.exit(1);
    }
    await mongoose.connect(uri);

    for (const p of posts) {
        const publishedAt = new Date(p.publishedAt);
        const result = await Post.findOneAndUpdate(
            { slug: p.slug },
            {
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                tags: p.tags,
                coverImage: p.coverImage,
                content: p.content,
                author: "Visakh RJ",
                published: true,
                publishedAt,
            },
            { upsert: true, new: true }
        );
        console.log(`✓ ${result.published ? "published" : "draft  "}  ${result.slug}`);
    }

    console.log(`\n✓ ${posts.length} posts upserted`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
