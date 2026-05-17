/**
 * Seed (or update) the single admin user.
 *
 * Usage:
 *   cp .env.example .env
 *   # fill MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD
 *   npm run seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../src/models/User";

async function main() {
    const uri = process.env.MONGODB_URI;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!uri || !email || !password) {
        console.error("✗ Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in env");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), passwordHash, name: "Admin" },
        { upsert: true, new: true }
    );

    console.log(`✓ Admin ready: ${result.email}`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
