"use client";

import { useRef, useState } from "react";
import { FileUp, Info, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { ALLOWED_ARTWORK_TYPES, MAX_ARTWORK_BYTES } from "@/lib/uploads/shared";
import { formatBytes } from "@/lib/utils";

export interface Attachment {
  ref: string;
  name: string;
  size?: number;
}

/** Private customer artwork upload. Files go to a secure store, never the public image route. */
export function ArtworkUpload({ value, onChange, max = 3, label = "Artwork (optional)" }: { value: Attachment[]; onChange: (v: Attachment[]) => void; max?: number; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (!ALLOWED_ARTWORK_TYPES.includes(file.type)) return toast.error("Upload a PNG, JPEG, WebP, GIF or PDF file.");
    if (file.size > MAX_ARTWORK_BYTES) return toast.error("File is too large. Maximum size is 4 MB — email larger files to us.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/attachments", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error(body.error || "Upload failed");
      onChange([...value, { ref: body.data.ref, name: body.data.name, size: body.data.size }]);
      toast.success("Artwork attached");
    } catch (e) {
      toast.error((e as Error).message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <p role="note" className="mb-2 flex items-start gap-2 rounded-md border border-white/20 bg-white/[0.06] px-3 py-2.5 text-xs leading-relaxed text-white/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          <strong className="font-bold text-white">All images for printing should be in .PNG format.</strong> If artwork is not provided as a PNG, a graphic design charge will be applied.
        </span>
      </p>
      <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.02] p-4">
        {value.length > 0 && (
          <ul className="mb-3 space-y-2">
            {value.map((a) => (
              <li key={a.ref} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.05] px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{a.name}</span>
                  {a.size ? <span className="shrink-0 text-xs text-white/45">{formatBytes(a.size)}</span> : null}
                </span>
                <button type="button" onClick={() => onChange(value.filter((v) => v.ref !== a.ref))} aria-label={`Remove ${a.name}`} className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {value.length < max && (
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileUp className="h-4 w-4" aria-hidden />}
            {busy ? "Uploading..." : "Attach a file"}
          </button>
        )}
        <p className="mt-1 text-center text-[11px] text-white/40">PNG preferred · JPEG, WebP, GIF or PDF also accepted · up to 4 MB · stored privately</p>
        <input ref={input} type="file" accept={ALLOWED_ARTWORK_TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
    </div>
  );
}
