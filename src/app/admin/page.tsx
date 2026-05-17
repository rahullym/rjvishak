import Link from "next/link";
import { dbConnect } from "@/lib/mongoose";
import { Post, type PostDoc } from "@/models/Post";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
    await dbConnect();
    const posts = await Post.find().sort({ updatedAt: -1 }).lean<PostDoc[]>();

    return (
        <div>
            <div className="flex items-end justify-between mb-10">
                <div>
                    <p className="text-[10px] font-bold text-[var(--color-muted-gold)] uppercase tracking-[0.3em] mb-2">Dashboard</p>
                    <h1 className="font-serif text-4xl text-[var(--color-deep-charcoal)] font-light">Blog Posts</h1>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex h-11 px-6 items-center rounded-full text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:-translate-y-0.5 transition-all"
                    style={{ background: "linear-gradient(135deg, #A8002B 0%, #600018 100%)" }}
                >
                    + New Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-24 rounded-2xl border border-dashed border-gray-300 bg-white">
                    <p className="font-serif text-2xl text-gray-400 mb-2">No posts yet</p>
                    <p className="text-sm text-gray-500 mb-6">Create your first blog post to get started.</p>
                    <Link href="/admin/posts/new" className="text-sm font-bold text-[var(--color-slate-blue)] hover:underline">
                        Create a post →
                    </Link>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#fafafa] border-b border-gray-100">
                            <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Updated</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((p) => (
                                <tr key={String(p._id)} className="border-t border-gray-100 hover:bg-[#fafafa] transition">
                                    <td className="px-6 py-4 font-serif text-lg text-[var(--color-deep-charcoal)]">{p.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.slug}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] ${
                                                p.published
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {p.published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(p.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/posts/${String(p._id)}/edit`}
                                            className="text-sm font-bold text-[var(--color-slate-blue)] hover:underline"
                                        >
                                            Edit →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
