import "server-only";
import { StoredUpload } from "@/models/StoredUpload";
import { Brand, PageContent, Product, ProductCategory, Service, SiteSettings, GalleryImage, TeamMember, Testimonial } from "@/models/content";
import { ALLOWED_FOLDERS, type UploadFolder } from "./shared";

export * from "./shared";

/** Normalizes a Buffer / BSON Binary (from .lean()) into a correctly-sized Buffer. */
export function toBuffer(v: unknown): Buffer {
  if (Buffer.isBuffer(v)) return v;
  const bin = v as { _bsontype?: string; buffer?: Uint8Array; position?: number };
  if (bin?._bsontype === "Binary" && bin.buffer instanceof Uint8Array) {
    const u = bin.buffer.subarray(0, bin.position ?? bin.buffer.length);
    return Buffer.from(u.buffer, u.byteOffset, u.byteLength);
  }
  if (v instanceof Uint8Array) return Buffer.from(v.buffer, v.byteOffset, v.byteLength);
  throw new Error("Unsupported binary value");
}

/** Detects real image type from file signature (magic bytes). */
export function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a") return { mime: "image/gif", ext: "gif" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

/** Detects types accepted for private customer artwork. */
export function sniffArtwork(buf: Buffer): { mime: string; ext: string } | null {
  const img = sniffImage(buf);
  if (img) return img;
  if (buf.toString("ascii", 0, 5) === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  return null;
}

export const FILENAME_RE = /^[0-9]{10,16}-[a-f0-9]{16}\.(png|jpg|jpeg|gif|webp)$/;

export function isValidFolder(f: string): f is UploadFolder {
  return (ALLOWED_FOLDERS as readonly string[]).includes(f);
}

export function isSafeFilename(name: string) {
  return !name.includes("..") && !name.includes("/") && !name.includes("\\") && FILENAME_RE.test(name);
}

/** Parses "/api/uploads/<folder>/<filename>" safely; returns null for anything else. */
export function parseUploadUrl(url: string | null | undefined): { folder: UploadFolder; filename: string } | null {
  if (!url || typeof url !== "string") return null;
  const path = url.split("?")[0];
  const m = /^\/api\/uploads\/([a-z]+)\/([^/\\]+)$/.exec(path);
  if (!m) return null;
  const [, folder, filename] = m;
  if (!isValidFolder(folder) || !isSafeFilename(filename)) return null;
  return { folder, filename };
}

/** Collects every /api/uploads/ URL found anywhere in a value. */
export function collectUploadUrls(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith("/api/uploads/")) out.add(value.split("?")[0]);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploadUrls(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => collectUploadUrls(v, out));
  }
  return out;
}

/** Returns true when any content document still references the URL. */
export async function isUploadReferenced(url: string): Promise<boolean> {
  const checks = await Promise.all([
    Product.exists({ images: url }),
    Service.exists({ $or: [{ heroImage: url }, { gallery: url }] }),
    Brand.exists({ $or: [{ logo: url }, { banner: url }] }),
    ProductCategory.exists({ image: url }),
    GalleryImage.exists({ image: url }),
    TeamMember.exists({ photo: url }),
    Testimonial.exists({ image: url }),
  ]);
  if (checks.some(Boolean)) return true;
  // Mixed-content documents are few; scan them in memory.
  const [pages, settings] = await Promise.all([PageContent.find().lean(), SiteSettings.find().lean()]);
  for (const d of [...pages, ...settings]) if (collectUploadUrls(d.data).has(url)) return true;
  return false;
}

/** Deletes a stored upload only if nothing references it. Call AFTER the parent document is saved. */
export async function deleteUploadIfUnused(url: string): Promise<boolean> {
  const parsed = parseUploadUrl(url);
  if (!parsed) return false;
  if (await isUploadReferenced(`/api/uploads/${parsed.folder}/${parsed.filename}`)) return false;
  const res = await StoredUpload.deleteOne(parsed);
  return res.deletedCount === 1;
}

/** After an update, removes images that were in the old document but are no longer used anywhere. */
export async function cleanupReplacedUploads(before: unknown, after: unknown) {
  const oldUrls = collectUploadUrls(before);
  const newUrls = collectUploadUrls(after);
  const removed = [...oldUrls].filter((u) => !newUrls.has(u));
  await Promise.allSettled(removed.map((u) => deleteUploadIfUnused(u)));
}
