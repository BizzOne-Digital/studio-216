import { type NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ApiError, handler, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { isUploadReferenced } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function find(ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid id");
  await connectDB();
  const doc = await StoredUpload.findById(id).select("folder filename").lean();
  if (!doc) throw new ApiError(404, "File not found");
  return { doc, url: `/api/uploads/${doc.folder}/${doc.filename}` };
}

/** Reports whether the image is still used by any content. */
export const GET = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { url } = await find(ctx);
  return ok({ url, referenced: await isUploadReferenced(url) });
});

/** Deletes an image only when no content references it. */
export const DELETE = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { doc, url } = await find(ctx);
  if (await isUploadReferenced(url)) {
    throw new ApiError(409, "This image is still used on the website. Remove it from that content first.");
  }
  await StoredUpload.deleteOne({ _id: doc._id });
  return ok({ deleted: true });
});
