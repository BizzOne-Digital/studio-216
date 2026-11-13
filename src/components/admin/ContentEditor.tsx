"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import type { UploadFolder } from "@/lib/uploads/shared";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { IconPicker, inputCls, labelCls, ListInput, Toggle } from "./fields";
import { LocalImageField } from "./LocalImageField";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const humanize = (k: string) =>
  k
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/Cta\b/, "CTA")
    .replace(/Faq\b/, "FAQ")
    .trim();
const isImageKey = (k: string) => /image$|^image|Image$|logo$|banner$/i.test(k) && !/images$/i.test(k);
const isImagesKey = (k: string) => /Images$/.test(k);
const isLong = (k: string, v: string) => /description|body|story|mission|vision|intro|note/i.test(k) || v.length > 90;

function Node({ k, value, onChange, folder }: { k: string; value: Json; onChange: (v: Json) => void; folder: UploadFolder }) {
  if (typeof value === "string") {
    if (k === "icon") return <Labeled label="Icon"><IconPicker value={value} onChange={onChange} /></Labeled>;
    if (isImageKey(k)) return <LocalImageField label={humanize(k)} value={value} onChange={onChange} folder={folder} className="max-w-md" />;
    return (
      <Labeled label={humanize(k)}>
        {isLong(k, value) ? (
          <textarea rows={k === "body" ? 14 : 3} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "resize-y")} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        )}
      </Labeled>
    );
  }
  if (typeof value === "boolean") return <Labeled label={humanize(k)}><Toggle checked={value} onChange={onChange} label={humanize(k)} /></Labeled>;
  if (typeof value === "number") return <Labeled label={humanize(k)}><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputCls} /></Labeled>;
  if (Array.isArray(value)) {
    const allStrings = value.every((v) => typeof v === "string");
    if (allStrings && (isImagesKey(k) || k === "workshopImages")) {
      return (
        <Labeled label={humanize(k)}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(value as string[]).map((src, i) => (
              <LocalImageField key={i} value={src} folder={folder} aspect="aspect-square" onChange={(u) => onChange(u ? value.map((v, j) => (j === i ? u : v)) : value.filter((_, j) => j !== i))} />
            ))}
            <LocalImageField value="" folder={folder} aspect="aspect-square" onChange={(u) => u && onChange([...value, u])} />
          </div>
        </Labeled>
      );
    }
    if (allStrings && (value.length === 0 || typeof value[0] === "string")) {
      return <Labeled label={humanize(k)}><ListInput value={value as string[]} onChange={(v) => onChange(v)} /></Labeled>;
    }
    const template = value[0] as Obj;
    return (
      <Labeled label={humanize(k)}>
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="relative rounded-lg border border-white/10 bg-white/[0.02] p-4 pr-12">
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-3 top-3 rounded p-1.5 text-red-300 hover:bg-red-500/10" aria-label="Remove item">
                <Trash2 className="h-4 w-4" />
              </button>
              <ObjectFields value={item as Obj} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} folder={folder} />
            </div>
          ))}
          {template && (
            <button type="button" onClick={() => onChange([...value, Object.fromEntries(Object.entries(template).map(([kk, vv]) => [kk, typeof vv === "string" ? "" : vv]))])} className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs font-semibold hover:border-white/50">
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
          )}
        </div>
      </Labeled>
    );
  }
  if (value && typeof value === "object") {
    return (
      <fieldset className="rounded-lg border border-white/10 p-4">
        <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">{humanize(k)}</legend>
        <ObjectFields value={value} onChange={onChange} folder={folder} />
      </fieldset>
    );
  }
  return null;
}

function ObjectFields({ value, onChange, folder }: { value: Obj; onChange: (v: Obj) => void; folder: UploadFolder }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className={cn((typeof v !== "string" || isLong(k, v as string) || isImageKey(k) || k === "icon") && "sm:col-span-2")}>
          <Node k={k} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} folder={folder} />
        </div>
      ))}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

export interface ContentEditorProps {
  page: "home" | "about" | "pricing" | "privacy" | "terms";
  title: string;
  description?: string;
  /** Limit to these top-level sections (for "Hero & Banners"). */
  sections?: string[];
  previewHref: string;
  hideHeader?: boolean;
}

export function ContentEditor({ page, title, description, sections, previewHref, hideHeader }: ContentEditorProps) {
  const [data, setData] = useState<Obj | null>(null);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<string>("");

  useEffect(() => {
    setData(null);
    api<{ data: Obj; published: boolean }>(`/api/admin/pages/${page}`)
      .then((r) => {
        setData(r.data);
        setPublished(r.published);
      })
      .catch((e) => toast.error((e as Error).message));
  }, [page]);

  const keys = useMemo(() => (data ? Object.keys(data).filter((k) => !sections || sections.includes(k)) : []), [data, sections]);
  const grouped = keys.length > 1 && keys.every((k) => data && typeof data[k] === "object" && !Array.isArray(data[k]));
  const active = tab && keys.includes(tab) ? tab : keys[0];

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await api(`/api/admin/pages/${page}`, { method: "PUT", json: { data, published } });
      toast.success("Changes saved and published");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!hideHeader && (
        <AdminPageHeader
          title={title}
          description={description}
          actions={
            <>
              <a href={previewHref} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-semibold hover:border-white/50">
                <ExternalLink className="h-4 w-4" aria-hidden /> Preview
              </a>
              <button onClick={save} disabled={saving || !data} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
              </button>
            </>
          }
        />
      )}
      {!data ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {(page === "privacy" || page === "terms") && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-ink p-4">
              <span className="text-sm">Page published</span>
              <Toggle checked={published} onChange={setPublished} label="Published" />
            </div>
          )}
          {grouped && (
            <div role="tablist" className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto">
              {keys.map((k) => (
                <button key={k} role="tab" aria-selected={active === k} onClick={() => setTab(k)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-semibold", active === k ? "bg-white text-ink" : "bg-white/[0.06] text-white/70 hover:text-white")}>
                  {humanize(k)}
                </button>
              ))}
            </div>
          )}
          <div className="rounded-xl border border-white/10 bg-ink p-5 sm:p-6">
            {grouped ? (
              <ObjectFields value={data[active] as Obj} onChange={(v) => setData({ ...data, [active]: v })} folder="pages" />
            ) : (
              <ObjectFields value={Object.fromEntries(keys.map((k) => [k, data[k]]))} onChange={(v) => setData({ ...data, ...v })} folder="pages" />
            )}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={save} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-ink disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
