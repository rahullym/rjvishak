import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="min-h-screen">
            <header className="bg-[var(--color-deep-charcoal)] text-white">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[var(--color-muted-gold)] uppercase tracking-[0.3em]">RJ Visakh</span>
                        <span className="text-white/30">·</span>
                        <span className="font-serif text-lg">CMS</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href="/admin" className="text-white/70 hover:text-white transition">Posts</Link>
                        <Link href="/admin/posts/new" className="text-white/70 hover:text-white transition">New Post</Link>
                        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition">Sign Out</button>
                        </form>
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        </div>
    );
}
