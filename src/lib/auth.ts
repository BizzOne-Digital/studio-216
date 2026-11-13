import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { AdminSession, AdminUser } from "@/models/auth";

export const SESSION_COOKIE = "s216_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
let DUMMY_HASH: string | undefined;

function hashToken(token: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyCredentials(email: string, password: string) {
  await connectDB();
  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
  // Compare against a dummy hash when the user does not exist to reduce timing differences.
  const hash = user?.passwordHash ?? (DUMMY_HASH ??= bcrypt.hashSync("not-a-real-password", 12));
  const ok = await bcrypt.compare(password, hash);
  return ok && user ? user : null;
}

export async function createSession(userId: string, userAgent?: string) {
  await connectDB();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await AdminSession.create({ tokenHash: hashToken(token), user: userId, expiresAt, userAgent: userAgent?.slice(0, 200) });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await connectDB();
      await AdminSession.deleteOne({ tokenHash: hashToken(token) });
    } catch {
      /* ignore */
    }
  }
  jar.delete(SESSION_COOKIE);
}

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Returns the signed-in admin or null. Validates the session against MongoDB on every call. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.MONGODB_URI) return null;
  try {
    await connectDB();
    const session = await AdminSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
    if (!session) return null;
    const user = await AdminUser.findById(session.user).lean();
    if (!user) return null;
    return { id: String(user._id), email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}
