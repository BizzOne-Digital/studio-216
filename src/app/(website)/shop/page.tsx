import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { BrandCard } from "@/components/home/FeaturedMerch";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ShopFilters } from "@/components/products/ShopFilters";
import { getBrands, getCategories, getFeaturedBrands, getProductFacets, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Premade Merch",
  description: "Shop ready-to-order apparel and merchandise from Studio 216 and our featured collections.",
  alternates: { canonical: "/shop" },
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [products, categories, brands, featured, facets] = await Promise.all([
    getProducts({ q: sp.q, category: sp.category, brand: sp.brand, size: sp.size, color: sp.color, sort: sp.sort, limit: 100 }),
    getCategories(),
    getBrands(),
    getFeaturedBrands(),
    getProductFacets(),
  ]);
  const brandNames = Object.fromEntries(brands.map((b) => [b.slug, b.name]));
  return (
    <>
      <PageHero title="Premade Merch" subtitle="Ready-to-order designs from our featured collections. Need something custom? We can make that too." crumbs={[{ label: "Premade Merch" }]} />
      <section className="brushed py-12 lg:py-16">
        <div className="container">
          {featured.length > 0 && (
            <div className="mb-12 grid gap-5 sm:grid-cols-2">
              {featured.map((b) => (
                <BrandCard key={b._id} brand={b} />
              ))}
            </div>
          )}
          <Suspense>
            <ShopFilters
              categories={categories.map((c) => ({ label: c.name, value: c.slug }))}
              brands={brands.map((b) => ({ label: b.name, value: b.slug }))}
              sizes={facets.sizes}
              colors={facets.colors}
            />
          </Suspense>
          <p className="mb-6 mt-8 text-sm text-white/55" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <ProductGrid products={products} brandNames={brandNames} />
        </div>
      </section>
    </>
  );
}
