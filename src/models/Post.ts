import mongoose, { Schema, model, models } from "mongoose";

export interface PostDoc {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    tags: string[];
    author: string;
    published: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<PostDoc>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
        excerpt: { type: String, default: "" },
        content: { type: String, required: true },
        coverImage: { type: String, default: "" },
        tags: { type: [String], default: [] },
        author: { type: String, default: "Visakh RJ" },
        published: { type: Boolean, default: false },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

PostSchema.index({ published: 1, publishedAt: -1 });

export const Post = models.Post || model<PostDoc>("Post", PostSchema);
