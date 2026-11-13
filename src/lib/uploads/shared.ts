/** Shared upload constants (safe to import on client and server). */
export const ALLOWED_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/** Chunk size kept well under Vercel's ~4.5 MB function request-body limit. */
export const UPLOAD_CHUNK_BYTES = 3 * 1024 * 1024;

/** Customer artwork is sent in a single request, so it must stay under the platform body limit. */
export const MAX_ARTWORK_BYTES = 4 * 1024 * 1024;
export const ALLOWED_ARTWORK_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="200" y="158" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#5a5a5a" letter-spacing="3">STUDIO 216</text></svg>`
  );

/** Legacy /uploads/... URLs never existed in production; treat them as missing. */
export function resolveImageSrc(src?: string | null): string {
  if (!src) return PLACEHOLDER_IMAGE;
  if (src.startsWith("/uploads/")) return PLACEHOLDER_IMAGE;
  return src;
}
