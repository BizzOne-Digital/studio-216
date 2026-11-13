import { type NextRequest } from "next/server";
import { handler, ok, pagination, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { isValidFolder } from "@/lib/uploads";
import { escapeRegex, toPlain } from "@/lib/utils";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Metadata listing only — binary `data` is never selected. */
export const GET = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  await connectDB();
  const url = new URL(req.url);
  const { page, limit, skip } = pagination(url, 24);
  const filter: Record<string, unknown> = {};
  const folder = url.searchParams.get("folder");
  if (folder && isValidFolder(folder)) filter.folder = folder;
  const q = url.searchParams.get("q")?.trim();
  if (q) filter.filename = new RegExp(escapeRegex(q.slice(0, 60)), "i");
  const [items, total] = await Promise.all([
    StoredUpload.find(filter).select("folder filename mimeType size createdAt").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StoredUpload.countDocuments(filter),
  ]);
  return ok({
    items: toPlain<Record<string, unknown>[]>(items).map((i) => ({ ...i, url: `/api/uploads/${i.folder}/${i.filename}` })),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});
