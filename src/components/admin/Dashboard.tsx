"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, FileQuestion, Images, Inbox, Loader2, PackageCheck, ShoppingCart, Hourglass } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/client";
import { cn, formatPrice } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS, INQUIRY_STATUS_LABELS } from "./constants";
import { statusTone } from "./SubmissionManager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = Record<string, any>;
interface DashData {
  stats: Record<string, number>;
  orderStatus: { _id: string; count: number }[];
  quoteStatus: { _id: string; count: number }[];
  recentOrders: Any[];
  recentQuotes: Any[];
  recentInquiries: Any[];
  series: { date: string; orders: number; quotes: number; inquiries: number }[];
}

export function Dashboard() {
  const [d, setD] = useState<DashData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    api<DashData>("/api/admin/dashboard").then(setD).catch((e) => setErr((e as Error).message));
  }, []);

  if (err) return <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">Could not load dashboard: {err}</p>;
  if (!d) return <Loader2 className="mx-auto mt-20 h-6 w-6 animate-spin" />;

  const s = d.stats;
  const cards = [
    { label: "Total Products", value: s.totalProducts, icon: Boxes, href: "/admin/products" },
    { label: "Active Products", value: s.activeProducts, icon: PackageCheck, href: "/admin/products" },
    { label: "Total Orders", value: s.totalOrders, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Pending Orders", value: s.pendingOrders, icon: Hourglass, href: "/admin/orders", warn: s.pendingOrders > 0 },
    { label: "Quote Requests", value: s.quoteRequests, icon: FileQuestion, href: "/admin/quotes", sub: `${s.newQuotes} new`, warn: s.newQuotes > 0 },
    { label: "New Inquiries", value: s.newInquiries, icon: Inbox, href: "/admin/inquiries", warn: s.newInquiries > 0 },
    { label: "Gallery Images", value: s.galleryImages, icon: Images, href: "/admin/gallery" },
  ];
  const attention = [
    s.pendingOrders > 0 && `${s.pendingOrders} order(s) need review or a quote`,
    s.newQuotes > 0 && `${s.newQuotes} new quote request(s) waiting`,
    s.newInquiries > 0 && `${s.newInquiries} new customer inquiry(ies)`,
    s.activeProducts === 0 && "No published products — the shop is empty",
  ].filter(Boolean) as string[];
  const hasActivity = d.series.some((x) => x.orders || x.quotes || x.inquiries);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Live numbers from your database." />

      {attention.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
            <AlertTriangle className="h-4 w-4" aria-hidden /> Needs attention
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-100/90">
            {attention.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={cn("rounded-xl border bg-ink p-4 transition hover:border-white/40", c.warn ? "border-amber-400/40" : "border-white/10")}>
            <c.icon className="h-5 w-5 text-white/60" aria-hidden />
            <p className="mt-3 font-display text-4xl font-black">{c.value}</p>
            <p className="text-xs text-white/55">{c.label}</p>
            {c.sub && <p className="mt-0.5 text-[11px] text-amber-200/80">{c.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-white/10 bg-ink p-5">
          <h2 className="display text-2xl">Recent Activity — last 30 days</h2>
          {hasActivity ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.series} margin={{ left: -20 }}>
                  <CartesianGrid stroke="#ffffff12" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} interval={4} />
                  <YAxis stroke="#888" fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#141414", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#ffffff08" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="orders" name="Orders" stackId="a" fill="#ffffff" />
                  <Bar dataKey="quotes" name="Quotes" stackId="a" fill="#9a9a9a" />
                  <Bar dataKey="inquiries" name="Inquiries" stackId="a" fill="#4a4a4a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 py-10 text-center text-sm text-white/45">No orders, quotes or inquiries in the last 30 days yet.</p>
          )}
        </section>
        <section className="rounded-xl border border-white/10 bg-ink p-5">
          <h2 className="display text-2xl">Order Status</h2>
          <StatusBars rows={d.orderStatus} labels={ORDER_STATUS_LABELS} />
          <h2 className="display mt-6 text-2xl">Quote Status</h2>
          <StatusBars rows={d.quoteStatus} labels={QUOTE_STATUS_LABELS} />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Recent title="Recent Orders" href="/admin/orders" rows={d.recentOrders} render={(r) => [r.reference, r.customer?.name, r.requiresQuote ? "Quote needed" : formatPrice(r.subtotal)]} labels={ORDER_STATUS_LABELS} />
        <Recent title="Recent Quote Requests" href="/admin/quotes" rows={d.recentQuotes} render={(r) => [r.reference, r.name, `${r.productType} × ${r.quantity}`]} labels={QUOTE_STATUS_LABELS} />
        <Recent title="Recent Inquiries" href="/admin/inquiries" rows={d.recentInquiries} render={(r) => [new Date(r.createdAt).toLocaleDateString(), r.name, r.subject || "—"]} labels={INQUIRY_STATUS_LABELS} />
      </div>
    </div>
  );
}

function StatusBars({ rows, labels }: { rows: { _id: string; count: number }[]; labels: Record<string, string> }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (!total) return <p className="mt-3 text-sm text-white/45">Nothing yet.</p>;
  return (
    <ul className="mt-3 space-y-2">
      {Object.keys(labels)
        .map((k) => ({ k, c: rows.find((r) => r._id === k)?.count ?? 0 }))
        .filter((r) => r.c > 0)
        .map((r) => (
          <li key={r.k} className="text-xs">
            <div className="mb-1 flex justify-between">
              <span className="text-white/70">{labels[r.k]}</span>
              <span className="font-bold">{r.c}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white" style={{ width: `${(r.c / total) * 100}%` }} />
            </div>
          </li>
        ))}
    </ul>
  );
}

function Recent({ title, href, rows, render, labels }: { title: string; href: string; rows: Any[]; render: (r: Any) => unknown[]; labels: Record<string, string> }) {
  return (
    <section className="rounded-xl border border-white/10 bg-ink p-5">
      <div className="flex items-center justify-between">
        <h2 className="display text-2xl">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-white/60 hover:text-white">
          View all
        </Link>
      </div>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-white/5 text-sm">
          {rows.map((r) => {
            const [a, b, c] = render(r);
            return (
              <li key={r._id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{String(b ?? "")}</span>
                  <span className="block truncate text-xs text-white/45">
                    {String(a ?? "")} · {String(c ?? "")}
                  </span>
                </span>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", statusTone(r.status))}>{labels[r.status] ?? r.status}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/45">None yet.</p>
      )}
    </section>
  );
}
