import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "./mongoose";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = (credentials?.email as string)?.toLowerCase().trim();
                const password = credentials?.password as string;
                if (!email || !password) return null;
                await dbConnect();
                const user = await User.findOne({ email });
                if (!user) return null;
                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;
                return { id: user._id.toString(), email: user.email, name: user.name };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.uid = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token?.uid && session.user) {
                (session.user as { id?: string }).id = token.uid as string;
            }
            return session;
        },
    },
});
