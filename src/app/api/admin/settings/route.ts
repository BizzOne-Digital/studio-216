import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { handler, ok, parseJson, requireAdmin } from "@/lib/api";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { mergeDeep } from "@/lib/data";
import { connectDB } from "@/lib/mongodb";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { settingsSchema } from "@/lib/validations";
import { SiteSettings } from "@/models/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  return ok(mergeDeep(DEFAULT_SETTINGS, doc?.data));
});

export const PUT = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  const data = await parseJson(req, settingsSchema);
  await connectDB();
  const before = await SiteSettings.findOne({ key: "main" }).lean();
  const saved = await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: { data } }, { upsert: true, new: true }).lean();
  await cleanupReplacedUploads(before?.data, saved?.data);
  revalidatePath("/", "layout");
  return ok(saved?.data);
});
