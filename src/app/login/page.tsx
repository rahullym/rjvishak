"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            setError("Invalid email or password.");
            return;
        }
        router.push(params.get("callbackUrl") || "/admin");
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <p className="text-[10px] font-bold text-[var(--color-muted-gold)] uppercase tracking-[0.4em] mb-3">RJ Visakh CMS</p>
                    <h1 className="font-serif text-4xl text-[var(--color-deep-charcoal)] font-light">Admin Login</h1>
                </div>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
                    <label className="block">
                        <span className="text-[10px] font-bold text-[var(--color-deep-charcoal)] uppercase tracking-[0.25em] mb-2 block">Email</span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-[#fafafa] border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--color-slate-blue)] focus:ring-2 focus:ring-[var(--color-slate-blue)]/10 transition"
                        />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-[var(--color-deep-charcoal)] uppercase tracking-[0.25em] mb-2 block">Password</span>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-[#fafafa] border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--color-slate-blue)] focus:ring-2 focus:ring-[var(--color-slate-blue)]/10 transition"
                        />
                    </label>
                    {error && <p className="text-sm text-[var(--color-slate-blue)]">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #A8002B 0%, #600018 100%)" }}
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
