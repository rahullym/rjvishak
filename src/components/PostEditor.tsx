"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";

interface PostInput {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string;
    author: string;
    published: boolean;
}

function slugify(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

export default function PostEditor({ initial }: { initial?: Partial<PostInput> & { _id?: string } }) {
    const router = useRouter();
    const [form, setForm] = useState<PostInput>({
        _id: initial?._id,
        title: initial?.title ?? "",
        slug: initial?.slug ?? "",
        excerpt: initial?.excerpt ?? "",
        content: initial?.content ?? "",
        coverImage: initial?.coverImage ?? "",
        tags: initial?.tags ?? "",
        author: initial?.author ?? "Visakh RJ",
        published: initial?.published ?? false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [autoSlug, setAutoSlug] = useState(!initial?._id);

    useEffect(() => {
        if (autoSlug) setForm((f) => ({ ...f, slug: slugify(f.title) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.title, autoSlug]);

    const html = useMemo(() => marked.parse(form.content || "", { async: false }) as string, [form.content]);

    function set<K extends keyof PostInput>(k: K, v: PostInput[K]) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    async function save(asPublished?: boolean) {
        setSaving(true);
        setError("");
        const payload = {
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            published: asPublished !== undefined ? asPublished : form.published,
        };
        const url = form._id ? `/api/admin/posts/${form._id}` : "/api/admin/posts";
        const method = form._id ? "PATCH" : "POST";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        setSaving(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error || `Save failed (${res.status})`);
            return;
        }
        router.push("/admin");
        router.refresh();
    }

    async function remove() {
        if (!form._id) return;
        if (!confirm("Delete this post permanently?")) return;
        setSaving(true);
        const res = await fetch(`/api/admin/posts/${form._id}`, { method: "DELETE" });
        setSaving(false);
        if (!res.ok) { setError("Delete failed"); return; }
        router.push("/admin");
        router.refresh();
    }

    return (
        <div>
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-[10px] font-bold text-[var(--color-muted-gold)] uppercase tracking-[0.3em] mb-2">{form._id ? "Edit" : "Create"}</p>
                    <h1 className="font-serif text-4xl text-[var(--color-deep-charcoal)] font-light">{form._id ? form.title || "Untitled" : "New Post"}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {form._id && (
                        <button
                            onClick={remove}
                            disabled={saving}
                            className="h-11 px-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-slate-blue)] border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={() => save(false)}
                        disabled={saving || !form.title}
                        className="h-11 px-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-deep-charcoal)] border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => save(true)}
                        disabled={saving || !form.title}
                        className="h-11 px-7 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:-translate-y-0.5 transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #A8002B 0%, #600018 100%)" }}
                    >
                        {saving ? "Saving…" : "Publish"}
                    </button>
                </div>
            </div>

            {error && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* Main column */}
                <div className="space-y-5">
                    <label className="block bg-white rounded-2xl border border-gray-200 p-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Title</span>
                        <input
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="Post title…"
                            className="w-full font-serif text-3xl text-[var(--color-deep-charcoal)] bg-transparent focus:outline-none placeholder:text-gray-300"
                        />
                    </label>

                    <label className="block bg-white rounded-2xl border border-gray-200 p-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Excerpt</span>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => set("excerpt", e.target.value)}
                            placeholder="One-sentence summary…"
                            rows={2}
                            className="w-full text-base text-[var(--color-deep-charcoal)] bg-transparent focus:outline-none resize-none placeholder:text-gray-300 leading-[1.7]"
                        />
                    </label>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 pt-6 pb-3 flex items-center justify-between border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Content (Markdown)</span>
                            <span className="text-[11px] text-gray-400">{form.content.length.toLocaleString()} chars</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <textarea
                                value={form.content}
                                onChange={(e) => set("content", e.target.value)}
                                placeholder="# Heading&#10;&#10;Write your post in **markdown**…"
                                className="min-h-[500px] p-6 font-mono text-sm leading-[1.7] focus:outline-none resize-none border-r border-gray-100"
                            />
                            <article
                                className="prose-cms p-6 overflow-auto max-h-[700px] text-[var(--color-deep-charcoal)] bg-[#fafafa]"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <label className="block">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Slug</span>
                            <div className="flex gap-2">
                                <input
                                    value={form.slug}
                                    onChange={(e) => { setAutoSlug(false); set("slug", slugify(e.target.value)); }}
                                    className="flex-1 h-10 px-3 rounded-lg bg-[#fafafa] border border-gray-200 text-sm font-mono focus:outline-none focus:border-[var(--color-slate-blue)]"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setAutoSlug(true); set("slug", slugify(form.title)); }}
                                    className="px-3 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition"
                                >
                                    Auto
                                </button>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Cover Image URL</span>
                            <input
                                value={form.coverImage}
                                onChange={(e) => set("coverImage", e.target.value)}
                                placeholder="https://…"
                                className="w-full h-10 px-3 rounded-lg bg-[#fafafa] border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-slate-blue)]"
                            />
                            {form.coverImage && (
                                <img src={form.coverImage} alt="" className="mt-3 w-full aspect-video object-cover rounded-lg border border-gray-100" />
                            )}
                        </label>

                        <label className="block">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Tags (comma-separated)</span>
                            <input
                                value={form.tags}
                                onChange={(e) => set("tags", e.target.value)}
                                placeholder="pmp, mindset, agile"
                                className="w-full h-10 px-3 rounded-lg bg-[#fafafa] border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-slate-blue)]"
                            />
                        </label>

                        <label className="block">
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 block">Author</span>
                            <input
                                value={form.author}
                                onChange={(e) => set("author", e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-[#fafafa] border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-slate-blue)]"
                            />
                        </label>

                        <label className="flex items-center gap-3 pt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.published}
                                onChange={(e) => set("published", e.target.checked)}
                                className="w-4 h-4 accent-[var(--color-slate-blue)]"
                            />
                            <span className="text-sm text-[var(--color-deep-charcoal)]">Published</span>
                        </label>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">Public URL preview</p>
                        <p className="font-mono text-xs text-gray-500 break-all">/blog/{form.slug || "your-slug"}</p>
                    </div>
                </aside>
            </div>

            <style jsx global>{`
                .prose-cms h1 { font-family: Playfair Display, serif; font-size: 2rem; font-weight: 400; margin: 1.5rem 0 0.75rem; }
                .prose-cms h2 { font-family: Playfair Display, serif; font-size: 1.5rem; font-weight: 400; margin: 1.5rem 0 0.5rem; }
                .prose-cms h3 { font-family: Playfair Display, serif; font-size: 1.25rem; font-weight: 500; margin: 1.25rem 0 0.5rem; }
                .prose-cms p  { line-height: 1.8; margin: 0.75rem 0; color: #4b5563; }
                .prose-cms ul, .prose-cms ol { padding-left: 1.25rem; margin: 0.75rem 0; }
                .prose-cms li { margin: 0.25rem 0; line-height: 1.7; color: #4b5563; }
                .prose-cms code { background: #1A0D10; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
                .prose-cms pre  { background: #1A0D10; color: #fff; padding: 1rem; border-radius: 8px; overflow-x: auto; }
                .prose-cms pre code { background: transparent; padding: 0; }
                .prose-cms a { color: #800020; text-decoration: underline; }
                .prose-cms blockquote { border-left: 3px solid #C02E4C; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #6b7280; }
                .prose-cms img { border-radius: 8px; margin: 1rem 0; }
            `}</style>
        </div>
    );
}
