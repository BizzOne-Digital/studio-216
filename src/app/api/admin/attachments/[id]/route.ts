import { NextResponse, type NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { ApiError, handler, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { toBuffer } from "@/lib/uploads";
import { PrivateAttachment } from "@/models/PrivateAttachment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Admin-only download of customer artwork. */
export const GET = handler(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid id");
  await connectDB();
  const doc = await PrivateAttachment.findById(id).select("+data").lean();
  if (!doc) throw new ApiError(404, "Attachment not found");
  const buf = toBuffer(doc.data);
  const inline = new URL(req.url).searchParams.get("inline") === "1" && doc.mimeType.startsWith("image/");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(buf.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${doc.originalName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
