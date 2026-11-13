import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IAdminUser {
  email: string;
  name: string;
  passwordHash: string;
  role: "owner" | "admin";
  lastLoginAt?: Date;
}
const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "Administrator" },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "admin"], default: "admin" },
    lastLoginAt: Date,
  },
  { timestamps: true }
);
export const AdminUser: Model<IAdminUser> =
  (mongoose.models.AdminUser as Model<IAdminUser>) || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export interface IAdminSession {
  tokenHash: string;
  user: Types.ObjectId;
  expiresAt: Date;
  userAgent?: string;
}
const AdminSessionSchema = new Schema<IAdminSession>(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
  },
  { timestamps: true }
);
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminSession: Model<IAdminSession> =
  (mongoose.models.AdminSession as Model<IAdminSession>) || mongoose.model<IAdminSession>("AdminSession", AdminSessionSchema);

/** Serverless-safe rate limiting (shared across instances via MongoDB TTL). */
export interface IRateLimit {
  key: string;
  count: number;
  expiresAt: Date;
}
const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit: Model<IRateLimit> =
  (mongoose.models.RateLimit as Model<IRateLimit>) || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
