import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { ApiError, handler, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_CHUNK_BYTES, isValidFolder, sniffImage, toBuffer } from "@/lib/uploads";
import { StoredUpload } from "@/models/StoredUpload";
import { UploadChunk } from "@/models/UploadChunk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EXT_FOR_MIME: Record<string, string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};

/**
 * Admin image upload.
 *
 * Single request: FormData { file, folder }.
 * Chunked (for files larger than one chunk, to stay under Vercel's ~4.5 MB body limit):
 *   FormData { file: <chunk>, folder, uploadId, index, total, name, type, size }
 *   Chunks are sent sequentially; the final chunk assembles, validates and stores the image.
 */
export const POST = handler(async (req: NextRequest) => {
  await requireAdmin(req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "Upload must be multipart form data. Large files may exceed the server limit.");
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "");
  if (!(file instanceof Blob)) throw new ApiError(400, "No file received");
  if (!isValidFolder(folder)) throw new ApiError(400, "Invalid upload folder");

  const total = Number(form.get("total") ?? 1);
  const index = Number(form.get("index") ?? 0);
  const uploadId = String(form.get("uploadId") ?? "");
  const declaredName = String(form.get("name") ?? (file as File).name ?? "");
  const declaredType = String(form.get("type") ?? file.type ?? "");
  const declaredSize = Number(form.get("size") ?? file.size);

  if (!ALLOWED_IMAGE_TYPES.includes(declaredType)) throw new ApiError(415, "Only PNG, JPEG, WebP or GIF images are allowed");
  if (!Number.isFinite(declaredSize) || declaredSize <= 0) throw new ApiError(400, "Empty file");
  if (declaredSize > MAX_IMAGE_BYTES) throw new ApiError(413, "Image must be 8 MB or smaller");
  if (!Number.isInteger(total) || total < 1 || total > Math.ceil(MAX_IMAGE_BYTES / UPLOAD_CHUNK_BYTES) + 1) throw new ApiError(400, "Invalid chunk count");
  if (!Number.isInteger(index) || index < 0 || index >= total) throw new ApiError(400, "Invalid chunk index");
  if (file.size > UPLOAD_CHUNK_BYTES + 1024 && total > 1) throw new ApiError(413, "Chunk too large");

  await connectDB();
  const chunk = Buffer.from(await file.arrayBuffer());

  let buffer: Buffer;
  if (total === 1) {
    buffer = chunk;
  } else {
    if (!/^[a-f0-9]{32}$/.test(uploadId)) throw new ApiError(400, "Invalid upload id");
    await UploadChunk.updateOne({ uploadId, index }, { $set: { data: chunk, createdAt: new Date() } }, { upsert: true });
    if (index < total - 1) return NextResponse.json({ success: true, received: index + 1, total });
    const parts = await UploadChunk.find({ uploadId }).sort({ index: 1 }).lean();
    if (parts.length !== total) throw new ApiError(400, "Upload incomplete. Please try again.");
    buffer = Buffer.concat(parts.map((p) => toBuffer(p.data)));
    await UploadChunk.deleteMany({ uploadId });
  }

  if (buffer.length > MAX_IMAGE_BYTES) throw new ApiError(413, "Image must be 8 MB or smaller");
  if (buffer.length !== declaredSize) throw new ApiError(400, "Upload size mismatch. Please try again.");

  const sniffed = sniffImage(buffer);
  if (!sniffed) throw new ApiError(415, "File is not a valid image");
  if (sniffed.mime !== declaredType) throw new ApiError(415, "File contents do not match its type");
  const nameExt = declaredName.split(".").pop()?.toLowerCase() ?? "";
  if (nameExt && !EXT_FOR_MIME[sniffed.mime].includes(nameExt)) throw new ApiError(415, "File extension does not match image type");

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${sniffed.ext}`;
  const saved = await StoredUpload.create({ folder, filename, mimeType: sniffed.mime, size: buffer.length, data: buffer });
  if (!saved?._id) throw new ApiError(500, "Could not save image");

  return NextResponse.json({
    success: true,
    url: `/api/uploads/${folder}/${filename}`,
    filename,
    size: buffer.length,
    folder,
  });
});
