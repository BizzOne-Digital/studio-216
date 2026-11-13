"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Paperclip, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { buttonClass } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, ready, update, remove } = useCart();

  // Refresh display prices and drop items that are no longer published.
  useEffect(() => {
    if (!ready || !items.length) return;
    const ids = [...new Set(items.map((i) => i.productId))].join(",");
    fetch(`/api/products?ids=${ids}`)
      .then((r) => r.json())
      .then((b) => {
        if (!b.success) return;
        const live = new Map<string, { price: number | null }>((b.data as { _id: string; price: number | null }[]).map((p) => [p._id, p]));
        items.forEach((i) => {
          const p = live.get(i.productId);
          if (!p) remove(i.key);
          else if ((p.price ?? null) !== i.price) update(i.key, { price: p.price ?? null });
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />;
  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <ShoppingBag className="mx-auto h-12 w-12" strokeWidth={1.3} aria-hidden />
        <h2 className="display mt-5 text-4xl">Your Cart Is Empty</h2>
        <p className="mt-3 text-white/70">Browse our premade merch or request a custom project.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonClass("silver")}>
            Shop Merch
          </Link>
          <Link href="/request-quote" className={buttonClass("outline")}>
            Request a Quote
          </Link>
        </div>
      </div>
    );
  }

  const quoteItems = items.filter((i) => i.price === null);
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
        {items.map((i) => (
          <li key={i.key} className="flex gap-4 p-4 sm:p-5">
            <Link href={`/shop/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-charcoal sm:h-28 sm:w-28">
              <SafeImage src={i.image} alt={i.name} fill sizes="112px" className="object-cover" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/shop/${i.slug}`} className="font-bold hover:underline">
                    {i.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-white/55">{[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")}</p>
                  {i.customization && <p className="mt-1 line-clamp-2 text-xs text-white/55">Notes: {i.customization}</p>}
                  {i.attachments.length > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/55">
                      <Paperclip className="h-3 w-3" aria-hidden /> {i.attachments.length} file(s) attached
                    </p>
                  )}
                </div>
                <button onClick={() => remove(i.key)} aria-label={`Remove ${i.name}`} className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex h-9 items-center rounded-md border border-white/20">
                  <button onClick={() => update(i.key, { quantity: Math.max(1, i.quantity - 1) })} aria-label="Decrease quantity" className="flex h-full w-9 items-center justify-center hover:bg-white/5">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold" aria-live="polite">
                    {i.quantity}
                  </span>
                  <button onClick={() => update(i.key, { quantity: Math.min(10000, i.quantity + 1) })} aria-label="Increase quantity" className="flex h-full w-9 items-center justify-center hover:bg-white/5">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold">{i.price === null ? <span className="text-silver">Quote required</span> : formatPrice(i.price * i.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="metal-border h-fit rounded-2xl p-6 lg:sticky lg:top-40">
        <h2 className="display text-3xl">Summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/65">Priced items subtotal</dt>
            <dd className="font-bold">{formatPrice(subtotal)}</dd>
          </div>
          {quoteItems.length > 0 && (
            <div className="flex justify-between">
              <dt className="text-white/65">Items needing a quote</dt>
              <dd className="font-bold">{quoteItems.length}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-white/65">Tax &amp; shipping</dt>
            <dd className="text-white/65">Confirmed with your order</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-lg bg-white/[0.04] p-3 text-xs leading-relaxed text-white/60">
          This is an order request. No payment is taken online — we&apos;ll confirm final pricing, payment and timing with you before production.
        </p>
        <Link href="/checkout" className={buttonClass("silver", "lg", "mt-5 w-full")}>
          Continue to Order Request
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-sm text-white/70 hover:text-white">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
