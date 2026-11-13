import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { ApiError, handler, ok, parseJson, requireAdmin } from "@/lib/api";
import { getResource } from "@/lib/admin-resources";
import { connectDB } from "@/lib/mongodb";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { toPlain } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const def = getResource(resource);
  if (!def) throw new ApiError(404, "Unknown resource");
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid id");
  await connectDB();
  return { def, id, resource };
}

export const GET = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { def, id } = await load(ctx);
  const doc = await def.model.findById(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  return ok(toPlain(doc));
});

export const PATCH = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { def, id, resource } = await load(ctx);
  const schema = def.schema instanceof z.ZodObject ? def.schema.partial() : def.schema;
  const raw = (await parseJson(req, z.record(z.unknown()))) as Record<string, unknown>;
  const updates = schema.parse(raw) as Record<string, unknown>;
  // Remove keys that were not sent so partial updates don't overwrite with defaults.
  for (const k of Object.keys(updates)) if (!(k in raw)) delete updates[k];

  const before = await def.model.findById(id).lean();
  if (!before) throw new ApiError(404, "Not found");

  const set: Record<string, unknown> = { ...updates };
  const push: Record<string, unknown> = {};
  if (resource === "orders" && updates.status && updates.status !== (before as { status?: string }).status) {
    push.statusHistory = { status: updates.status, at: new Date() };
  }
  const after = await def.model
    .findByIdAndUpdate(id, { $set: set, ...(Object.keys(push).length ? { $push: push } : {}) }, { new: true, runValidators: true })
    .lean();
  if (!after) throw new ApiError(404, "Not found");

  // Only after the new state is persisted, clean up images no longer used anywhere.
  await cleanupReplacedUploads(before, after);
  revalidatePath("/", "layout");
  return ok(toPlain(after));
});

export const DELETE = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { def, id } = await load(ctx);
  const doc = await def.model.findByIdAndDelete(id).lean();
  if (!doc) throw new ApiError(404, "Not found");
  await cleanupReplacedUploads(doc, null);
  revalidatePath("/", "layout");
  return ok({ deleted: true });
});
