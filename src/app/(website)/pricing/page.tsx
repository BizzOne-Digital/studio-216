import type { Metadata } from "next";
import { Boxes, Layers, Palette, Shirt, SlidersHorizontal } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { OfferCards } from "@/components/home/OfferCards";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { getPricingContent, getPromotions, getServices } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Pricing",
  description: "Custom projects, custom pricing. Request a quote for custom apparel, embroidery, printing and promotional products.",
  alternates: { canonical: "/pricing" },
};

const FACTOR_ICONS = [Shirt, Boxes, Palette, Layers, SlidersHorizontal];

export default async function PricingPage() {
  const [pricing, promotions, services] = await Promise.all([getPricingContent(), getPromotions(), getServices()]);
  return (
    <>
      <PageHero title={pricing.heading} subtitle={pricing.intro} crumbs={[{ label: "Pricing" }]} />
      <section className="brushed py-20">
        <div className="container">
          <Reveal>
            <SectionHeading eyebrow="What affects pricing" title="Every Quote Is Built Around You" />
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pricing.factors.map((f, i) => {
              const I = FACTOR_ICONS[i % FACTOR_ICONS.length];
              return (
                <RevealItem key={f}>
                  <div className="metal-border h-full rounded-xl p-6">
                    <I className="h-8 w-8" strokeWidth={1.4} aria-hidden />
                    <p className="mt-4 font-display text-xl font-bold uppercase italic">{f}</p>
                  </div>
                </RevealItem>
              );
            })}
          </Stagger>
        </div>
      </section>
      {promotions.length > 0 && (
        <section className="paper py-20 text-ink">
          <div className="container">
            <SectionHeading eyebrow="Offers" title="Ways to Save" tone="light" description="Ask about eligibility when you request your quote. Offers are confirmed on your quote." />
            <div className="mt-10">
              <OfferCards promotions={promotions} />
            </div>
          </div>
        </section>
      )}
      <section id="quote" className="bg-charcoal py-20">
        <div className="container max-w-5xl">
          <SectionHeading eyebrow="Get started" title="Request Your Quote" />
          <div className="mt-10">
            <QuoteForm services={services.map((s) => s.title)} />
          </div>
        </div>
      </section>
    </>
  );
}
