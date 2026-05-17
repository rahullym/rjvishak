import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill in your MongoDB connection string.");
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, { bufferCommands: false });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
