"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { buttonClass } from "@/components/ui/Button";
import { Field, SubmitButton } from "./Field";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  method: "pickup" | "delivery";
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  website?: string;
}

export function CheckoutForm() {
  const { items, ready, clear } = useCart();
  const [result, setResult] = useState<{ reference: string; subtotal: number; requiresQuote: boolean } | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { method: "pickup", state: "GA" } });
  const method = watch("method");

  const onSubmit = async (v: FormValues) => {
    try {
      const res = await api<{ reference: string; subtotal: number; requiresQuote: boolean }>("/api/orders", {
        method: "POST",
        json: {
          customer: { name: v.name, email: v.email, phone: v.phone, company: v.company },
          shipping: { method: v.method, address: v.address, city: v.city, state: v.state, zip: v.zip },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color, customization: i.customization, attachmentIds: i.attachments.map((a) => a.ref) })),
          notes: v.notes,
          website: v.website,
        },
      });
      setResult(res);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (result) {
    return (
      <div className="metal-border mx-auto max-w-2xl rounded-2xl p-8 text-center sm:p-12" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14" strokeWidth={1.4} aria-hidden />
        <h2 className="display mt-5 text-4xl sm:text-5xl">Order Request Received</h2>
        <p className="mt-4 text-white/75">
          Your order reference is <strong className="text-white">{result.reference}</strong>.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/65">
          {result.requiresQuote
            ? "Some items need a custom quote. We'll review your request and contact you with final pricing."
            : `Estimated subtotal: ${formatPrice(result.subtotal)} (before any applicable tax or shipping).`}{" "}
          Your order is pending confirmation — no payment has been taken. We&apos;ll contact you to confirm details and arrange payment before production.
        </p>
        <Link href="/shop" className={buttonClass("silver", "lg", "mt-8")}>
          Back to Shop
        </Link>
      </div>
    );
  }

  if (ready && !items.length) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <h2 className="display text-4xl">Your Cart Is Empty</h2>
        <Link href="/shop" className={buttonClass("silver", "md", "mt-6")}>
          Shop Merch
        </Link>
      </div>
    );
  }

  const req = { required: "This field is required" };
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const anyQuote = items.some((i) => i.price === null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="metal-border grid gap-5 rounded-2xl p-6 sm:grid-cols-2 sm:p-8">
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
        <h2 className="display text-3xl sm:col-span-2">Contact Details</h2>
        <Field label="Full name" required error={errors.name?.message} htmlFor="o-name">
          <input id="o-name" className="field" autoComplete="name" {...register("name", req)} />
        </Field>
        <Field label="Email" required error={errors.email?.message} htmlFor="o-email">
          <input id="o-email" type="email" className="field" autoComplete="email" {...register("email", { ...req, pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
        </Field>
        <Field label="Phone" required error={errors.phone?.message} htmlFor="o-phone">
          <input id="o-phone" type="tel" className="field" autoComplete="tel" {...register("phone", req)} />
        </Field>
        <Field label="Company (optional)" htmlFor="o-company">
          <input id="o-company" className="field" autoComplete="organization" {...register("company")} />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="display mb-4 mt-2 text-3xl">Pickup or Delivery</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { v: "pickup", t: "Local pickup", d: "We'll confirm the pickup details with you." },
              { v: "delivery", t: "Delivery / shipping", d: "Shipping cost is confirmed with your order." },
            ].map((o) => (
              <label key={o.v} className="flex cursor-pointer gap-3 rounded-lg border border-white/15 p-4 has-[:checked]:border-white has-[:checked]:bg-white/[0.05]">
                <input type="radio" value={o.v} className="mt-1 accent-white" {...register("method")} />
                <span>
                  <span className="block text-sm font-bold">{o.t}</span>
                  <span className="block text-xs text-white/55">{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {method === "delivery" && (
          <>
            <Field label="Street address" required error={errors.address?.message} className="sm:col-span-2" htmlFor="o-address">
              <input id="o-address" className="field" autoComplete="street-address" {...register("address", req)} />
            </Field>
            <Field label="City" required error={errors.city?.message} htmlFor="o-city">
              <input id="o-city" className="field" autoComplete="address-level2" {...register("city", req)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" required error={errors.state?.message} htmlFor="o-state">
                <input id="o-state" className="field" autoComplete="address-level1" {...register("state", req)} />
              </Field>
              <Field label="ZIP" required error={errors.zip?.message} htmlFor="o-zip">
                <input id="o-zip" className="field" autoComplete="postal-code" inputMode="numeric" {...register("zip", req)} />
              </Field>
            </div>
          </>
        )}
        <Field label="Order notes (optional)" className="sm:col-span-2" htmlFor="o-notes">
          <textarea id="o-notes" rows={3} className="field resize-y" {...register("notes")} />
        </Field>
      </div>

      <aside className="metal-border h-fit rounded-2xl p-6 lg:sticky lg:top-40">
        <h2 className="display text-3xl">Your Items</h2>
        <ul className="mt-4 divide-y divide-white/10 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {i.quantity} × {i.name}
                </span>
                <span className="text-xs text-white/50">{[i.size, i.color].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="shrink-0 font-semibold">{i.price === null ? "Quote" : formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-white/10 pt-4 text-sm">
          <span className="text-white/65">Estimated subtotal</span>
          <span className="font-bold">
            {formatPrice(subtotal)}
            {anyQuote && " + quote"}
          </span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/55">Prices are confirmed by our team. No payment is collected online. Tax and shipping, if applicable, are confirmed with you.</p>
        <SubmitButton busy={isSubmitting} className="mt-5 w-full">
          Submit Order Request
        </SubmitButton>
      </aside>
    </form>
  );
}
