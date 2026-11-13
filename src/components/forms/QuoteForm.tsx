"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { quoteSchema, type QuoteInput } from "@/lib/validations";
import { ArtworkUpload, type Attachment } from "./ArtworkUpload";
import { Field, SubmitButton } from "./Field";

const METHODS = ["Not sure — recommend one", "Embroidery", "Screen / T-shirt printing", "DTF transfer", "UV DTF", "Vinyl / decal"];

export function QuoteForm({ type = "quote", services, defaults }: { type?: "quote" | "custom_order"; services: string[]; defaults?: { service?: string; productType?: string } }) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { type, quantity: 1, service: defaults?.service ?? "", productType: defaults?.productType ?? "", attachmentIds: [] },
  });

  const onSubmit = async (values: QuoteInput) => {
    try {
      const res = await api<{ reference: string }>("/api/quotes", { method: "POST", json: { ...values, type, attachmentIds: files.map((f) => f.ref) } });
      setDone(res.reference);
      reset();
      setFiles([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (done) {
    return (
      <div className="metal-border rounded-2xl p-8 text-center sm:p-12" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14" strokeWidth={1.4} aria-hidden />
        <h2 className="display mt-5 text-4xl">Request Received</h2>
        <p className="mx-auto mt-3 max-w-md text-white/75">
          Thank you. Your reference number is <strong className="text-white">{done}</strong>. We&apos;ll review your details and contact you with next steps. Keep this number for your records.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => setDone(null)} className="rounded-lg border border-white/30 px-5 py-3 text-sm font-bold hover:bg-white hover:text-ink">
            Submit another request
          </button>
          <Link href="/shop" className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-ink">
            Browse merch
          </Link>
        </div>
      </div>
    );
  }

  const e = errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="metal-border grid gap-5 rounded-2xl p-6 sm:grid-cols-2 sm:p-8">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
      <Field label="Full name" required error={e.name?.message} htmlFor="q-name">
        <input id="q-name" className="field" autoComplete="name" {...register("name")} />
      </Field>
      <Field label="Email" required error={e.email?.message} htmlFor="q-email">
        <input id="q-email" type="email" className="field" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Phone" required error={e.phone?.message} htmlFor="q-phone">
        <input id="q-phone" type="tel" className="field" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="Company name (optional)" error={e.company?.message} htmlFor="q-company">
        <input id="q-company" className="field" autoComplete="organization" {...register("company")} />
      </Field>
      <Field label="Service" error={e.service?.message} htmlFor="q-service">
        <select id="q-service" className="field" {...register("service")}>
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Other">Other / not sure</option>
        </select>
      </Field>
      <Field label="Product type" required error={e.productType?.message} htmlFor="q-product">
        <input id="q-product" className="field" placeholder="e.g. hoodies, polos, tumblers" {...register("productType")} />
      </Field>
      <Field label="Quantity" required error={e.quantity?.message} htmlFor="q-qty">
        <input id="q-qty" type="number" min={1} inputMode="numeric" className="field" {...register("quantity")} />
      </Field>
      <Field label={type === "custom_order" ? "Printing or embroidery preference" : "Preferred method"} error={e.method?.message} htmlFor="q-method">
        <select id="q-method" className="field" {...register("method")}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preferred colors" error={e.colors?.message} htmlFor="q-colors">
        <input id="q-colors" className="field" placeholder="e.g. black shirts, silver logo" {...register("colors")} />
      </Field>
      <Field label="Sizes" error={e.sizes?.message} htmlFor="q-sizes">
        <input id="q-sizes" className="field" placeholder="e.g. 10 M, 15 L, 5 XL" {...register("sizes")} />
      </Field>
      <Field label={type === "custom_order" ? "Design instructions" : "Design description"} required error={e.description?.message} className="sm:col-span-2" htmlFor="q-desc">
        <textarea id="q-desc" rows={5} className="field resize-y" placeholder="Describe your design, placement (front, back, sleeve), text and any references." {...register("description")} />
      </Field>
      <Field label="Needed-by date (optional)" error={e.neededBy?.message} htmlFor="q-date">
        <input id="q-date" type="date" className="field [color-scheme:dark]" {...register("neededBy")} />
      </Field>
      <div className="hidden sm:block" />
      <div className="sm:col-span-2">
        <ArtworkUpload value={files} onChange={setFiles} />
      </div>
      <Field label={type === "custom_order" ? "Additional notes" : "Additional instructions"} error={e.instructions?.message} className="sm:col-span-2" htmlFor="q-notes">
        <textarea id="q-notes" rows={3} className="field resize-y" {...register("instructions")} />
      </Field>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/50">Submitting this form does not place a paid order. We&apos;ll confirm pricing and details with you first.</p>
        <SubmitButton busy={isSubmitting}>{type === "custom_order" ? "Submit Custom Order" : "Request My Quote"}</SubmitButton>
      </div>
    </form>
  );
}
