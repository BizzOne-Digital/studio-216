import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type z, type ZodTypeAny } from "zod";
import { getAdmin, type AdminIdentity } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { RateLimit } from "@/models/auth";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

/** Wraps a route handler with consistent error handling. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof ApiError) return fail(e.status, e.message, e.details);
      if (e instanceof ZodError) return fail(400, "Please check the highlighted fields.", e.flatten().fieldErrors);
      const err = e as { code?: number; message?: string };
      if (err?.code === 11000) return fail(409, "That slug or value is already in use.");
      console.error("[api]", e);
      return fail(500, "Something went wrong. Please try again.");
    }
  };
}

export async function parseJson<S extends ZodTypeAny>(req: NextRequest | Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
  return schema.parse(body);
}

/** Same-origin check for state-changing requests (CSRF defense alongside SameSite cookies). */
export function assertSameOrigin(req: NextRequest | Request) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new ApiError(403, "Missing origin");
  try {
    if (new URL(origin).host !== host) throw new ApiError(403, "Cross-origin request rejected");
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(403, "Invalid origin");
  }
}

/** Requires a valid admin session; enforces same-origin on writes. */
export async function requireAdmin(req: NextRequest | Request): Promise<AdminIdentity> {
  assertSameOrigin(req);
  const admin = await getAdmin();
  if (!admin) throw new ApiError(401, "Unauthorized");
  return admin;
}

export function clientIp(req: NextRequest | Request) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

/** Fixed-window rate limiter stored in MongoDB (works across serverless instances). */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  await connectDB();
  const now = new Date();
  const doc = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true }
  ).lean();
  if (!doc) {
    try {
      await RateLimit.updateOne(
        { key },
        { $set: { count: 1, expiresAt: new Date(now.getTime() + windowSec * 1000) } },
        { upsert: true }
      );
    } catch {
      /* race: another request created it */
    }
    return;
  }
  if (doc.count > limit) throw new ApiError(429, "Too many requests. Please wait a moment and try again.");
}

export function pagination(url: URL, defLimit = 20) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || defLimit));
  return { page, limit, skip: (page - 1) * limit };
}
