import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CartView } from "@/components/products/CartView";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <PageHero title="Your Cart" crumbs={[{ label: "Shop", href: "/shop" }, { label: "Cart" }]} />
      <section className="brushed py-12 lg:py-16">
        <div className="container">
          <CartView />
        </div>
      </section>
    </>
  );
}
