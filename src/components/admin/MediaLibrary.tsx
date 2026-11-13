"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Loader2, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
import { api } from "@/lib/client";
import { ALLOWED_FOLDERS, ALLOWED_IMAGE_TYPES, type UploadFolder } from "@/lib/uploads/shared";
import { cn, formatBytes } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { inputCls } from "./fields";
import { uploadImage } from "./uploadImage";

interface Item {
  _id: string;
  folder: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
  url: string;
}

export function MediaLibrary() {
  const [data, setData] = useState<{ items: Item[]; total: number; page: number; pages: number } | null>(null);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [uploadFolder, setUploadFolder] = useState<UploadFolder>("misc");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setData(await api(`/api/admin/media?page=${page}&folder=${folder}&q=${encodeURIComponent(q)}`));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [page, folder, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      try {
        await uploadImage(f, uploadFolder);
        toast.success(`Uploaded ${f.name}`);
      } catch (e) {
        toast.error(`${f.name}: ${(e as Error).message}`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    setPage(1);
    load();
  };

  const remove = async (it: Item) => {
    try {
      const check = await api<{ referenced: boolean }>(`/api/admin/media/${it._id}`);
      if (check.referenced) return toast.error("This image is still used on the website. Remove it from that content first.");
      if (!confirm("Delete this image permanently?")) return;
      await api(`/api/admin/media/${it._id}`, { method: "DELETE" });
      toast.success("Image deleted");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="All uploaded images, stored in MongoDB so they survive redeployments. Images in use cannot be deleted."
        actions={
          <div className="flex gap-2">
            <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value as UploadFolder)} className={cn(inputCls, "h-10 w-32 py-0")} aria-label="Upload folder">
              {ALLOWED_FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button onClick={() => input.current?.click()} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-ink disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            </button>
            <input ref={input} type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => onFiles(e.target.files)} />
          </div>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search filenames</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} placeholder="Search filenames..." className={cn(inputCls, "pl-9")} />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["", ...ALLOWED_FOLDERS].map((f) => (
            <button key={f || "all"} onClick={() => (setFolder(f), setPage(1))} className={cn("rounded-full px-3.5 py-2 text-xs font-semibold", folder === f ? "bg-white text-ink" : "bg-white/[0.06] text-white/70")}>
              {f || "All"}
            </button>
          ))}
        </div>
      </div>
      {!data ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />
      ) : data.items.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-ink py-14 text-center text-sm text-white/45">No images yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.items.map((it) => (
            <li key={it._id} className="overflow-hidden rounded-lg border border-white/10 bg-ink">
              <div className="relative aspect-square bg-white/[0.03]">
                <SafeImage src={it.url} alt={it.filename} fill sizes="200px" className="object-cover" />
              </div>
              <div className="p-2.5">
                <p className="truncate font-mono text-[10px] text-white/60" title={it.filename}>
                  {it.folder}/{it.filename}
                </p>
                <p className="text-[10px] text-white/40">
                  {formatBytes(it.size)} · {new Date(it.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => copy(it.url)} className="flex flex-1 items-center justify-center gap-1 rounded border border-white/15 py-1.5 text-[11px] font-semibold hover:border-white/50">
                    <Copy className="h-3 w-3" /> Copy URL
                  </button>
                  <button onClick={() => remove(it)} className="rounded border border-white/15 px-2 text-red-300 hover:border-red-400/60" aria-label="Delete">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && data.pages > 1 && (
        <div className="mt-5 flex items-center justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-white/15 p-2 disabled:opacity-40" aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {data.page} of {data.pages}
          </span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-md border border-white/15 p-2 disabled:opacity-40" aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <p className="mt-6 text-xs text-white/40">To replace an image on the website, open the content item that uses it and click Replace. The old image is removed automatically once nothing uses it.</p>
    </div>
  );
}
