import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export const metadata: Metadata = { title: "Order Request", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <PageHero title="Order Request" subtitle="Tell us where to reach you. We'll confirm pricing, payment and timing before production." crumbs={[{ label: "Cart", href: "/cart" }, { label: "Order Request" }]} />
      <section className="brushed py-12 lg:py-16">
        <div className="container">
          <CheckoutForm />
        </div>
      </section>
    </>
  );
}
