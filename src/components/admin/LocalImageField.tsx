"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
import { ALLOWED_IMAGE_TYPES, type UploadFolder } from "@/lib/uploads/shared";
import { cn } from "@/lib/utils";
import { uploadImage } from "./uploadImage";

export interface LocalImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  aspect?: string;
}

/**
 * Reusable admin image field. Uploads to MongoDB-backed storage via POST /api/upload and
 * returns only the saved public URL through onChange. The previous image is kept until the
 * parent content is saved; unused images are cleaned up server-side after that save succeeds.
 */
export function LocalImageField({ value, onChange, folder, label, disabled, required, className, aspect = "aspect-video" }: LocalImageFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const pick = () => !disabled && !busy && input.current?.click();

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    try {
      const res = await uploadImage(file, folder, setProgress);
      onChange(res.url);
      toast.success("Image uploaded — remember to save your changes");
    } catch (e) {
      // Existing image is preserved on failure.
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={className}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-silver">
          {label}
          {required && <span className="ml-0.5 text-white">*</span>}
        </span>
      )}
      <div className={cn("group relative overflow-hidden rounded-lg border border-dashed border-white/20 bg-white/[0.03]", aspect)}>
        {value ? (
          <SafeImage src={value} alt={label || "Selected image"} fill sizes="400px" className="object-cover" />
        ) : (
          <button type="button" onClick={pick} disabled={disabled || busy} className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-white/60 transition hover:bg-white/[0.04] hover:text-white">
            <ImagePlus className="h-7 w-7" strokeWidth={1.4} aria-hidden />
            Upload image
            <span className="text-[11px] text-white/35">PNG, JPEG, WebP, GIF · max 8 MB</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/80 text-sm">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            Uploading {progress > 0 ? `${progress}%` : "..."}
          </div>
        )}
      </div>
      {value && (
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={pick} disabled={disabled || busy} className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold hover:border-white/50 disabled:opacity-50">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Replace
          </button>
          <button type="button" onClick={() => onChange("")} disabled={disabled || busy || required} className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-red-300 hover:border-red-400/60 disabled:opacity-40">
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
          </button>
        </div>
      )}
      <input ref={input} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
