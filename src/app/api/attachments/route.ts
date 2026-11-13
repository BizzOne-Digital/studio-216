import crypto from "crypto";
import { type NextRequest } from "next/server";
import { ApiError, assertSameOrigin, clientIp, handler, ok, rateLimit } from "@/lib/api";
import { hashAttachmentToken } from "@/lib/attachments";
import { connectDB } from "@/lib/mongodb";
import { MAX_ARTWORK_BYTES, sniffArtwork } from "@/lib/uploads";
import { PrivateAttachment } from "@/models/PrivateAttachment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Customer artwork upload (quote, custom order, product customization).
 * Files are stored privately and are only downloadable by authenticated admins.
 * Returns an "id:token" reference the customer submits with their form (ownership proof).
 */
export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit(`attach:${clientIp(req)}`, 20, 60 * 60);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(413, "File is too large. Maximum size is 4 MB.");
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) throw new ApiError(400, "No file received");
  if (file.size === 0) throw new ApiError(400, "Empty file");
  if (file.size > MAX_ARTWORK_BYTES) throw new ApiError(413, "File is too large. Maximum size is 4 MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sniffArtwork(buffer);
  if (!kind) throw new ApiError(415, "Upload a PNG, JPEG, WebP, GIF or PDF file");

  await connectDB();
  // Opportunistic cleanup of artwork that was uploaded but never submitted with a form.
  void PrivateAttachment.deleteMany({ claimed: false, createdAt: { $lt: new Date(Date.now() - 24 * 3600 * 1000) } }).catch(() => {});
  const token = crypto.randomBytes(16).toString("hex");
  const name = ((file as File).name || `artwork.${kind.ext}`).replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  const doc = await PrivateAttachment.create({
    originalName: name,
    mimeType: kind.mime,
    size: buffer.length,
    data: buffer,
    tokenHash: hashAttachmentToken(token),
  });
  return ok({ ref: `${doc._id}:${token}`, name, size: buffer.length }, 201);
});
