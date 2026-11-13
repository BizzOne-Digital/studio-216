import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, handler, ok, pagination, parseJson, requireAdmin } from "@/lib/api";
import { getResource } from "@/lib/admin-resources";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex, toPlain } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string }> };

export const GET = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { resource } = await ctx.params;
  const def = getResource(resource);
  if (!def) throw new ApiError(404, "Unknown resource");
  await connectDB();

  const url = new URL(req.url);
  const { page, limit, skip } = pagination(url, 25);
  const filter: Record<string, unknown> = {};
  for (const f of def.filters) {
    const v = url.searchParams.get(f);
    if (v === null || v === "") continue;
    filter[f] = v === "true" ? true : v === "false" ? false : v.slice(0, 80);
  }
  const q = url.searchParams.get("q")?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q.slice(0, 80)), "i");
    filter.$or = def.searchFields.map((f) => ({ [f]: rx }));
  }
  const [items, total] = await Promise.all([
    def.model.find(filter).sort(def.defaultSort).skip(skip).limit(limit).lean(),
    def.model.countDocuments(filter),
  ]);
  return ok({ items: toPlain(items), total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const POST = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { resource } = await ctx.params;
  const def = getResource(resource);
  if (!def || !def.canCreate) throw new ApiError(404, "Unknown resource");
  const data = await parseJson(req, def.schema);
  await connectDB();
  const created = await def.model.create(data);
  revalidatePath("/", "layout");
  return ok(toPlain(created), 201);
});
