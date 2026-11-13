"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
import { api } from "@/lib/client";
import { cn, formatPrice, slugify } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { FieldInput, labelCls, Toggle, type FieldDef } from "./fields";

type Row = Record<string, unknown> & { _id: string };

export interface ResourceConfig {
  resource: string;
  title: string;
  singular: string;
  description?: string;
  fields: FieldDef[];
  columns: { key: string; label: string; type?: "image" | "images" | "price" | "text" | "bool" }[];
  /** Field used for the toggle shown in the list (published / active). */
  toggleField?: string;
  /** Field the slug is generated from. */
  slugFrom?: string;
  defaults: Record<string, unknown>;
  /** Option sources for "select" fields with string options (e.g. "categories"). */
  optionSources?: Record<string, { resource: string; label: string; value: string }>;
  previewPath?: (row: Row) => string | null;
}

interface ListResp {
  items: Row[];
  total: number;
  page: number;
  pages: number;
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const [data, setData] = useState<ListResp | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<Record<string, { label: string; value: string }[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<ListResp>(`/api/admin/${config.resource}?page=${page}&limit=20&q=${encodeURIComponent(q)}`);
      setData(res);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [config.resource, page, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    if (!config.optionSources) return;
    Object.entries(config.optionSources).forEach(async ([key, src]) => {
      try {
        const res = await api<ListResp>(`/api/admin/${src.resource}?limit=100`);
        setOptions((o) => ({ ...o, [key]: res.items.map((r) => ({ label: String(r[src.label]), value: String(r[src.value]) })) }));
      } catch {
        /* ignore */
      }
    });
  }, [config.optionSources]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) payload[f.name] = editing[f.name];
    try {
      if ("_id" in editing && editing._id) {
        await api(`/api/admin/${config.resource}/${editing._id}`, { method: "PATCH", json: payload });
        toast.success(`${config.singular} updated`);
      } else {
        await api(`/api/admin/${config.resource}`, { method: "POST", json: payload });
        toast.success(`${config.singular} created`);
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/${config.resource}/${row._id}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggle = async (row: Row) => {
    if (!config.toggleField) return;
    const next = !row[config.toggleField];
    setData((d) => d && { ...d, items: d.items.map((r) => (r._id === row._id ? { ...r, [config.toggleField!]: next } : r)) });
    try {
      await api(`/api/admin/${config.resource}/${row._id}`, { method: "PATCH", json: { [config.toggleField]: next } });
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const setField = (name: string, v: unknown) =>
    setEditing((e) => {
      if (!e) return e;
      const next = { ...e, [name]: v };
      // Auto-generate slug for new items until the slug is edited manually.
      if (config.slugFrom === name && !("_id" in e && e._id) && (!e.slug || e.slug === slugify(String(e[name] ?? "")))) next.slug = slugify(String(v));
      return next;
    });

  const isEdit = Boolean(editing && "_id" in editing && editing._id);
  const preview = useMemo(() => (editing && isEdit && config.previewPath ? config.previewPath(editing as Row) : null), [editing, isEdit, config]);

  return (
    <div>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        actions={
          <button onClick={() => setEditing({ ...config.defaults })} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-ink">
            <Plus className="h-4 w-4" aria-hidden /> Add {config.singular}
          </button>
        }
      />
      <div className="mb-4 flex items-center gap-3">
        <label className="relative max-w-sm flex-1">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} placeholder="Search..." className="w-full rounded-md border border-white/15 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm focus:border-white/60 focus:outline-none" />
        </label>
        {data && <span className="text-xs text-white/45">{data.total} total</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/45">
            <tr>
              {config.columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              {config.toggleField && <th className="px-4 py-3 font-semibold">{config.toggleField === "active" ? "Active" : "Published"}</th>}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && !data ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-white/45">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : data?.items.length ? (
              data.items.map((row) => (
                <tr key={row._id} className="hover:bg-white/[0.02]">
                  {config.columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-middle">
                      <Cell row={row} col={c} />
                    </td>
                  ))}
                  {config.toggleField && (
                    <td className="px-4 py-3">
                      <Toggle checked={Boolean(row[config.toggleField])} onChange={() => toggle(row)} label="Toggle visibility" />
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(row)} className="rounded-md p-2 hover:bg-white/10" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(row)} className="rounded-md p-2 text-red-300 hover:bg-red-500/10" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-white/45">
                  Nothing here yet. Click &ldquo;Add {config.singular}&rdquo; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
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

      {editing && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/70" onClick={() => !saving && setEditing(null)}>
          <div role="dialog" aria-modal="true" aria-label={`${isEdit ? "Edit" : "New"} ${config.singular}`} className="flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#0e0e0e]" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
              <h2 className="display text-2xl">
                {isEdit ? "Edit" : "New"} {config.singular}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Close" className="rounded-md p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {config.fields.map((f) => (
                  <div key={f.name} className={cn((f.full || ["textarea", "images", "image", "list", "icon"].includes(f.type)) && "sm:col-span-2", f.type === "boolean" && "flex items-center justify-between gap-4 rounded-lg border border-white/10 px-4 py-3")}>
                    <label className={f.type === "boolean" ? "text-sm font-semibold" : labelCls}>
                      {f.label}
                      {"required" in f && f.required && <span className="ml-0.5">*</span>}
                    </label>
                    <FieldInput def={f} value={editing[f.name]} onChange={(v) => setField(f.name, v)} options={options[f.name]} />
                    {f.help && <p className="mt-1 text-[11px] text-white/40">{f.help}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              {preview ? (
                <a href={preview} target="_blank" rel="noopener" className="text-xs font-semibold text-white/60 hover:text-white">
                  Preview on site ↗
                </a>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button onClick={() => setEditing(null)} disabled={saving} className="h-10 rounded-lg border border-white/15 px-4 text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ row, col }: { row: Row; col: ResourceConfig["columns"][number] }) {
  const v = row[col.key];
  if (col.type === "image" || col.type === "images") {
    const src = col.type === "images" ? (v as string[])?.[0] : (v as string);
    return (
      <span className="relative block h-11 w-14 overflow-hidden rounded bg-white/5">
        {src ? <SafeImage src={src} alt="" fill sizes="56px" className="object-cover" /> : null}
      </span>
    );
  }
  if (col.type === "price") return <span>{formatPrice(v as number) ?? <span className="text-white/40">Quote</span>}</span>;
  if (col.type === "bool") return <span className={v ? "text-white" : "text-white/35"}>{v ? "Yes" : "No"}</span>;
  return <span className="line-clamp-2 max-w-xs">{String(v ?? "")}</span>;
}
