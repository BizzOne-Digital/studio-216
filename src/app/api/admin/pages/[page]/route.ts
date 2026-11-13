import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, handler, ok, parseJson, requireAdmin } from "@/lib/api";
import { DEFAULT_ABOUT, DEFAULT_HOME, DEFAULT_PRICING, DEFAULT_PRIVACY, DEFAULT_TERMS } from "@/config/defaults";
import { mergeDeep } from "@/lib/data";
import { connectDB } from "@/lib/mongodb";
import { cleanupReplacedUploads, collectUploadUrls } from "@/lib/uploads";
import { imageUrl, PAGE_KEYS, pageContentSchema } from "@/lib/validations";
import { PageContent } from "@/models/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, unknown> = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  pricing: DEFAULT_PRICING,
  privacy: DEFAULT_PRIVACY,
  terms: DEFAULT_TERMS,
};

type Ctx = { params: Promise<{ page: string }> };

async function pageKey(ctx: Ctx) {
  const { page } = await ctx.params;
  if (!(PAGE_KEYS as readonly string[]).includes(page)) throw new ApiError(404, "Unknown page");
  return page;
}

/** Keep only keys that exist in the default content shape (prevents arbitrary data injection). */
function pickKnown(base: unknown, input: unknown): unknown {
  if (Array.isArray(base)) return Array.isArray(input) ? input.slice(0, 50).map((v) => pickKnown(base[0], v)) : base;
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = {};
    const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    for (const k of Object.keys(base as Record<string, unknown>)) {
      out[k] = k in src ? pickKnown((base as Record<string, unknown>)[k], src[k]) : (base as Record<string, unknown>)[k];
    }
    return out;
  }
  if (typeof base === "string") return typeof input === "string" ? input.slice(0, 10000) : base;
  if (base === undefined) return typeof input === "string" ? input.slice(0, 10000) : input;
  return typeof input === typeof base ? input : base;
}

export const GET = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const page = await pageKey(ctx);
  await connectDB();
  const doc = await PageContent.findOne({ page }).lean();
  return ok({ data: mergeDeep(DEFAULTS[page], doc?.data), published: doc?.published ?? true });
});

export const PUT = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const page = await pageKey(ctx);
  const body = await parseJson(req, pageContentSchema);
  const data = pickKnown(DEFAULTS[page], body.data) as Record<string, unknown>;

  // Validate every image-looking field.
  const walk = (v: unknown, key = ""): void => {
    if (typeof v === "string" && /image|Image|Images/.test(key) && !imageUrl.safeParse(v).success) {
      throw new ApiError(400, `Invalid image URL in "${key}"`);
    }
    if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(data);
  void collectUploadUrls;

  await connectDB();
  const before = await PageContent.findOne({ page }).lean();
  const saved = await PageContent.findOneAndUpdate(
    { page },
    { $set: { data, ...(body.published !== undefined ? { published: body.published } : {}) } },
    { upsert: true, new: true }
  ).lean();
  await cleanupReplacedUploads(before?.data, saved?.data);
  revalidatePath("/", "layout");
  return ok({ data: saved?.data, published: saved?.published });
});
