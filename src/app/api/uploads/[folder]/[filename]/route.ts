import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isSafeFilename, isValidFolder, toBuffer } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ folder: string; filename: string }> };

/** Public image delivery for admin-uploaded site images only (customer artwork is stored elsewhere). */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { folder, filename } = await ctx.params;
  if (!isValidFolder(folder) || !isSafeFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).select("+data").lean();
    if (!doc) return new NextResponse("Not found", { status: 404 });
    const buf = toBuffer(doc.data);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch (e) {
    console.error("[uploads] read failed", e);
    return new NextResponse("Unavailable", { status: 503 });
  }
}
