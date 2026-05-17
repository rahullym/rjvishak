import mongoose, { Schema, model, models } from "mongoose";

export interface UserDoc {
    _id: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, default: "Admin" },
    },
    { timestamps: true }
);

export const User = models.User || model<UserDoc>("User", UserSchema);
