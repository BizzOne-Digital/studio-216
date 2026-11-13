import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Custom Order",
  description: "Submit a custom merchandise request — apparel, embroidery, printing, drinkware, stickers and more.",
  alternates: { canonical: "/custom-order" },
};

export default async function CustomOrderPage() {
  const services = await getServices();
  return (
    <>
      <PageHero title="Custom Order" subtitle="Have something specific in mind? Share the details and your artwork — we'll take it from idea to finished product." crumbs={[{ label: "Custom Order" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container max-w-5xl">
          <QuoteForm type="custom_order" services={services.map((s) => s.title)} />
        </div>
      </section>
    </>
  );
}
