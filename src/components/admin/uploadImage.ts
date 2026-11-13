import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_CHUNK_BYTES, type UploadFolder } from "@/lib/uploads/shared";

export interface UploadResult {
  success: true;
  url: string;
  filename: string;
  size: number;
  folder: string;
}

function randomHex(bytes = 16) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Uploads an image to POST /api/upload. Files larger than one chunk are sent in
 * sequential chunks so every request stays under the serverless body limit (~4.5 MB on Vercel).
 */
export async function uploadImage(file: File, folder: UploadFolder, onProgress?: (pct: number) => void): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Only PNG, JPEG, WebP or GIF images are allowed.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be 8 MB or smaller.");
  if (file.size === 0) throw new Error("The file is empty.");

  const total = Math.max(1, Math.ceil(file.size / UPLOAD_CHUNK_BYTES));
  const uploadId = randomHex();
  let last: unknown;
  for (let index = 0; index < total; index++) {
    const fd = new FormData();
    fd.append("file", total === 1 ? file : file.slice(index * UPLOAD_CHUNK_BYTES, (index + 1) * UPLOAD_CHUNK_BYTES), file.name);
    fd.append("folder", folder);
    fd.append("name", file.name);
    fd.append("type", file.type);
    fd.append("size", String(file.size));
    if (total > 1) {
      fd.append("uploadId", uploadId);
      fd.append("index", String(index));
      fd.append("total", String(total));
    }
    let res: Response;
    try {
      res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "same-origin" });
    } catch {
      throw new Error("Network error during upload. Please retry.");
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
      if (res.status === 413 && !body.error) throw new Error("The upload was rejected as too large by the server.");
      throw new Error(body.error || `Upload failed (${res.status})`);
    }
    last = body;
    onProgress?.(Math.round(((index + 1) / total) * 100));
  }
  return last as UploadResult;
}
