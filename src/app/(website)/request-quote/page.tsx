import type { Metadata } from "next";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { getServices, getSettings } from "@/lib/data";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request a custom quote for embroidery, T-shirt printing, DTF transfers, promotional products, decals, banners and signage.",
  alternates: { canonical: "/request-quote" },
};

type Props = { searchParams: Promise<{ service?: string; product?: string }> };

export default async function RequestQuotePage({ searchParams }: Props) {
  const [services, settings, sp] = await Promise.all([getServices(), getSettings(), searchParams]);
  return (
    <>
      <PageHero title="Request a Quote" subtitle="Tell us about your project. We'll review the details and send you a clear quote." crumbs={[{ label: "Request a Quote" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_340px]">
          <QuoteForm services={services.map((s) => s.title)} defaults={{ service: sp.service?.slice(0, 120), productType: sp.product?.slice(0, 120) }} />
          <aside className="space-y-4">
            {[
              { icon: FileCheck2, t: "Clear, itemized quotes", d: "Pricing is based on product, quantity, method and design complexity." },
              { icon: ShieldCheck, t: "Proof before production", d: "Nothing is produced until you approve your design." },
              { icon: Clock, t: "Timeline confirmed on your quote", d: "Share your needed-by date and we'll confirm what's possible." },
            ].map(({ icon: I, t, d }) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <I className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                <h2 className="mt-3 font-bold">{t}</h2>
                <p className="mt-1 text-sm text-white/65">{d}</p>
              </div>
            ))}
            <div className="rounded-xl bg-white p-5 text-ink">
              <p className="text-sm font-semibold">Prefer to talk?</p>
              <a href={telHref(settings.phone)} className="mt-1 block font-display text-3xl font-black italic">
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="mt-1 block break-all text-sm underline">
                {settings.email}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
