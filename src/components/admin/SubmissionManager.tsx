"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, Phone, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { cn, formatPrice, telHref } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { INQUIRY_STATUS_LABELS, ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "./constants";
import { inputCls, labelCls } from "./fields";

type Kind = "orders" | "quotes" | "inquiries";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any> & { _id: string };

const META: Record<Kind, { title: string; description: string; statuses: Record<string, string> }> = {
  orders: { title: "Orders", description: "Order requests from the shop. No payment is collected online.", statuses: ORDER_STATUS_LABELS },
  quotes: { title: "Quote Requests", description: "Quote and custom order requests from customers.", statuses: QUOTE_STATUS_LABELS },
  inquiries: { title: "Customer Inquiries", description: "Messages from the contact form.", statuses: INQUIRY_STATUS_LABELS },
};

export function statusTone(s: string) {
  if (["new", "awaiting_quote"].includes(s)) return "bg-white text-ink";
  if (["cancelled", "rejected"].includes(s)) return "bg-red-500/15 text-red-300";
  if (["completed", "resolved", "accepted"].includes(s)) return "bg-emerald-500/15 text-emerald-300";
  return "bg-white/10 text-white/85";
}

export function SubmissionManager({ kind }: { kind: Kind }) {
  const meta = META[kind];
  const [data, setData] = useState<{ items: Row[]; total: number; page: number; pages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api(`/api/admin/${kind}?page=${page}&limit=20&q=${encodeURIComponent(q)}&status=${status}`));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [kind, page, q, status]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div>
      <AdminPageHeader title={meta.title} description={meta.description} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} placeholder="Search name, email, reference..." className={cn(inputCls, "pl-9")} />
        </label>
        <select value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} className={cn(inputCls, "sm:w-56")} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(meta.statuses).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table / mobile cards */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
        {loading && !data ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : data?.items.length ? (
          <ul className="divide-y divide-white/5">
            {data.items.map((r) => (
              <li key={r._id}>
                <button onClick={() => setOpen(r)} className="grid w-full gap-1 px-4 py-3.5 text-left text-sm transition hover:bg-white/[0.03] sm:grid-cols-[150px_1fr_1fr_140px_110px] sm:items-center sm:gap-4">
                  <span className="font-mono text-xs text-white/60">{r.reference ?? new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold">{kind === "orders" ? r.customer?.name : r.name}</span>
                  <span className="truncate text-white/60">
                    {kind === "orders" ? `${r.items?.length ?? 0} item(s) · ${r.requiresQuote ? "Quote needed" : formatPrice(r.subtotal)}` : kind === "quotes" ? `${r.type === "custom_order" ? "Custom order" : "Quote"} · ${r.productType} × ${r.quantity}` : r.subject || r.message}
                  </span>
                  <span className="text-xs text-white/45">{new Date(r.createdAt).toLocaleString()}</span>
                  <span className={cn("w-fit rounded-full px-2.5 py-1 text-[11px] font-bold", statusTone(r.status))}>{meta.statuses[r.status] ?? r.status}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-white/45">No {meta.title.toLowerCase()} found.</p>
        )}
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

      {open && <Detail kind={kind} row={open} statuses={meta.statuses} onClose={() => setOpen(null)} onSaved={(r) => (setOpen(r), load())} onDeleted={() => (setOpen(null), load())} />}
    </div>
  );
}

function Detail({ kind, row, statuses, onClose, onSaved, onDeleted }: { kind: Kind; row: Row; statuses: Record<string, string>; onClose: () => void; onSaved: (r: Row) => void; onDeleted: () => void }) {
  const [status, setStatus] = useState<string>(row.status);
  const [notes, setNotes] = useState<string>(row.internalNotes ?? "");
  const [quoted, setQuoted] = useState<string>(row.quotedPrice != null ? String(row.quotedPrice) : "");
  const [payment, setPayment] = useState<string>(row.paymentStatus ?? "pending");
  const [saving, setSaving] = useState(false);

  const email = kind === "orders" ? row.customer?.email : row.email;
  const phone = kind === "orders" ? row.customer?.phone : row.phone;
  const name = kind === "orders" ? row.customer?.name : row.name;

  const save = async () => {
    setSaving(true);
    const json: Record<string, unknown> = { status, internalNotes: notes };
    if (kind === "quotes") json.quotedPrice = quoted === "" ? null : Number(quoted);
    if (kind === "orders") json.paymentStatus = payment;
    try {
      const updated = await api<Row>(`/api/admin/${kind}/${row._id}`, { method: "PATCH", json });
      toast.success("Saved");
      onSaved(updated);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this record permanently?")) return;
    try {
      await api(`/api/admin/${kind}/${row._id}`, { method: "DELETE" });
      toast.success("Deleted");
      onDeleted();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const attachments: string[] = kind === "orders" ? row.items?.flatMap((i: Row) => i.attachmentIds ?? []) ?? [] : row.attachmentIds ?? [];
  const info: [string, unknown][] =
    kind === "quotes"
      ? [
          ["Type", row.type === "custom_order" ? "Custom order" : "Quote request"],
          ["Company", row.company],
          ["Service", row.service],
          ["Product type", row.productType],
          ["Quantity", row.quantity],
          ["Method", row.method],
          ["Colors", row.colors],
          ["Sizes", row.sizes],
          ["Needed by", row.neededBy ? new Date(row.neededBy).toLocaleDateString() : ""],
          ["Description", row.description],
          ["Instructions", row.instructions],
        ]
      : kind === "inquiries"
        ? [
            ["Subject", row.subject],
            ["Message", row.message],
          ]
        : [
            ["Company", row.customer?.company],
            ["Fulfillment", row.shipping?.method === "delivery" ? `Delivery: ${[row.shipping.address, row.shipping.city, row.shipping.state, row.shipping.zip].filter(Boolean).join(", ")}` : "Local pickup"],
            ["Customer notes", row.notes],
          ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/70" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Details" className="flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#0e0e0e]" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h2 className="display text-2xl">{row.reference ?? name}</h2>
            <p className="text-xs text-white/45">{new Date(row.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
          <section className="rounded-lg border border-white/10 p-4">
            <p className="font-bold">{name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`Studio 216 — ${row.reference ?? "Your inquiry"}`)}`} className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-ink">
                  <Mail className="h-3.5 w-3.5" aria-hidden /> {email}
                </a>
              )}
              {phone && (
                <a href={telHref(phone)} className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-bold">
                  <Phone className="h-3.5 w-3.5" aria-hidden /> {phone}
                </a>
              )}
            </div>
          </section>

          <dl className="divide-y divide-white/5 rounded-lg border border-white/10">
            {info
              .filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[140px_1fr]">
                  <dt className="text-white/45">{k}</dt>
                  <dd className="whitespace-pre-line">{String(v)}</dd>
                </div>
              ))}
          </dl>

          {kind === "orders" && (
            <section>
              <h3 className={labelCls}>Items</h3>
              <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
                {row.items?.map((it: Row, i: number) => (
                  <li key={i} className="px-4 py-3">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">
                        {it.quantity} × {it.name}
                      </span>
                      <span>{it.lineTotal != null ? formatPrice(it.lineTotal) : "Quote"}</span>
                    </div>
                    <p className="text-xs text-white/50">{[it.size && `Size ${it.size}`, it.color, it.unitPrice != null && `${formatPrice(it.unitPrice)} each`].filter(Boolean).join(" · ")}</p>
                    {it.customization && <p className="mt-1 text-xs text-white/70">Customization: {it.customization}</p>}
                  </li>
                ))}
                <li className="flex justify-between px-4 py-3 font-bold">
                  <span>Subtotal (priced items)</span>
                  <span>{formatPrice(row.subtotal)}</span>
                </li>
              </ul>
            </section>
          )}

          {attachments.length > 0 && (
            <section>
              <h3 className={labelCls}>Customer artwork</h3>
              <ul className="flex flex-wrap gap-2">
                {attachments.map((id, i) => (
                  <li key={id}>
                    <a href={`/api/admin/attachments/${id}`} className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold hover:border-white/60">
                      <Download className="h-3.5 w-3.5" aria-hidden /> File {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="grid gap-4 rounded-lg border border-white/10 p-4 sm:grid-cols-2">
            <label>
              <span className={labelCls}>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                {Object.entries(statuses).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            {kind === "quotes" && (
              <label>
                <span className={labelCls}>Quoted price (USD)</span>
                <input type="number" min={0} step="0.01" value={quoted} onChange={(e) => setQuoted(e.target.value)} className={inputCls} />
              </label>
            )}
            {kind === "orders" && (
              <label>
                <span className={labelCls}>Payment</span>
                <select value={payment} onChange={(e) => setPayment(e.target.value)} className={inputCls}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (recorded manually)</option>
                  <option value="not_required">Not required</option>
                </select>
              </label>
            )}
            <label className="sm:col-span-2">
              <span className={labelCls}>Internal notes (never shown to customer)</span>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={cn(inputCls, "resize-y")} />
            </label>
          </section>

          {kind === "orders" && row.statusHistory?.length > 0 && (
            <section>
              <h3 className={labelCls}>Status history</h3>
              <ol className="space-y-1 text-xs text-white/60">
                {row.statusHistory.map((h: Row, i: number) => (
                  <li key={i}>
                    {new Date(h.at).toLocaleString()} — {statuses[h.status] ?? h.status}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button onClick={del} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300 hover:text-red-200">
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
          </button>
          <div className="flex gap-2">
            {kind === "quotes" && (
              <button onClick={() => setStatus("completed")} className="h-10 rounded-lg border border-white/15 px-4 text-sm font-semibold">
                Mark completed
              </button>
            )}
            <button onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
