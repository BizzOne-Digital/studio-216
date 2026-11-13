"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { ICON_NAMES, Icon } from "@/components/ui/Icon";
import type { UploadFolder } from "@/lib/uploads/shared";
import { cn } from "@/lib/utils";
import { LocalImageField } from "./LocalImageField";

export type FieldDef =
  | { name: string; label: string; type: "text" | "textarea" | "slug" | "url"; required?: boolean; placeholder?: string; help?: string; full?: boolean; rows?: number }
  | { name: string; label: string; type: "number" | "price"; help?: string; full?: boolean }
  | { name: string; label: string; type: "boolean"; help?: string; full?: boolean }
  | { name: string; label: string; type: "select"; options: { label: string; value: string }[] | string; help?: string; full?: boolean }
  | { name: string; label: string; type: "image"; folder: UploadFolder; required?: boolean; help?: string; full?: boolean }
  | { name: string; label: string; type: "images"; folder: UploadFolder; max?: number; help?: string; full?: boolean }
  | { name: string; label: string; type: "list"; placeholder?: string; help?: string; full?: boolean }
  | { name: string; label: string; type: "icon"; help?: string; full?: boolean };

export const inputCls = "w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none";
export const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-silver";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-white" : "bg-white/15")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full transition-all", checked ? "left-[22px] bg-ink" : "left-0.5 bg-white/70")} />
    </button>
  );
}

/** Editable list of short strings (sizes, colors, benefits...). */
export function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder ?? "Type and press Enter (comma-separate multiple)"} className={inputCls} />
        <button type="button" onClick={add} className="rounded-md border border-white/15 px-3 hover:border-white/50" aria-label="Add">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <li key={v + i} className="flex items-center gap-1 rounded-full bg-white/[0.08] py-1 pl-3 pr-1 text-xs">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${v}`} className="rounded-full p-0.5 hover:bg-white/15">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ImagesInput({ value, onChange, folder, max = 12 }: { value: string[]; onChange: (v: string[]) => void; folder: UploadFolder; max?: number }) {
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {value.map((url, i) => (
        <div key={url + i}>
          <LocalImageField value={url} folder={folder} aspect="aspect-square" onChange={(u) => onChange(u ? value.map((v, j) => (j === i ? u : v)) : value.filter((_, j) => j !== i))} />
          <div className="mt-1 flex gap-1">
            <button type="button" onClick={() => move(i, -1)} className="rounded border border-white/10 p-1 hover:border-white/40" aria-label="Move left">
              <ArrowUp className="h-3 w-3 -rotate-90" />
            </button>
            <button type="button" onClick={() => move(i, 1)} className="rounded border border-white/10 p-1 hover:border-white/40" aria-label="Move right">
              <ArrowDown className="h-3 w-3 -rotate-90" />
            </button>
            {i === 0 && <span className="ml-1 text-[10px] uppercase tracking-wider text-white/45">Main image</span>}
          </div>
        </div>
      ))}
      {value.length < max && <LocalImageField value="" folder={folder} aspect="aspect-square" onChange={(u) => u && onChange([...value, u])} />}
    </div>
  );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {ICON_NAMES.map((n) => (
        <button key={n} type="button" title={n} aria-label={n} aria-pressed={value === n} onClick={() => onChange(n)} className={cn("flex aspect-square items-center justify-center rounded-md border transition", value === n ? "border-white bg-white text-ink" : "border-white/10 hover:border-white/40")}>
          <Icon name={n} className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function FieldInput({ def, value, onChange, options }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void; options?: { label: string; value: string }[] }) {
  switch (def.type) {
    case "textarea":
      return <textarea rows={def.rows ?? 4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} className={cn(inputCls, "resize-y")} />;
    case "number":
    case "price":
      return (
        <input
          type="number"
          step={def.type === "price" ? "0.01" : "1"}
          min={0}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? (def.type === "price" ? null : 0) : Number(e.target.value))}
          placeholder={def.type === "price" ? "Leave empty for Request Pricing" : undefined}
          className={inputCls}
        />
      );
    case "boolean":
      return <Toggle checked={Boolean(value)} onChange={onChange} label={def.label} />;
    case "select": {
      const opts = typeof def.options === "string" ? options ?? [] : def.options;
      return (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">— None —</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    case "image":
      return <LocalImageField value={(value as string) ?? ""} onChange={onChange} folder={def.folder} required={def.required} />;
    case "images":
      return <ImagesInput value={(value as string[]) ?? []} onChange={onChange} folder={def.folder} max={def.max} />;
    case "list":
      return <ListInput value={(value as string[]) ?? []} onChange={onChange} placeholder={def.placeholder} />;
    case "icon":
      return <IconPicker value={(value as string) ?? ""} onChange={onChange} />;
    default:
      return <input type={def.type === "url" ? "url" : "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={"placeholder" in def ? def.placeholder : undefined} className={inputCls} />;
  }
}
