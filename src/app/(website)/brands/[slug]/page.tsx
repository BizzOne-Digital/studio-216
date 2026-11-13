import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SafeImage } from "@/components/ui/SafeImage";
import { getBrands, getProducts } from "@/lib/data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

async function findBrand(slug: string) {
  return (await getBrands()).find((b) => b.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await findBrand((await params).slug);
  if (!b) return { title: "Collection not found" };
  return { title: `${b.name} Collection`, description: b.description.slice(0, 160), alternates: { canonical: `/brands/${b.slug}` } };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await findBrand(slug);
  if (!brand) notFound();
  const [products, brands] = await Promise.all([getProducts({ brand: slug, limit: 100 }), getBrands()]);
  return (
    <>
      <PageHero title={`${brand.name} ${brand.tagline || "Collection"}`} subtitle={brand.description} image={brand.banner} crumbs={[{ label: "Shop", href: "/shop" }, { label: brand.name }]} />
      <section className="brushed py-14 lg:py-16">
        <div className="container">
          {brand.logo && (
            <div className="relative mx-auto mb-12 h-24 w-64">
              <SafeImage src={brand.logo} alt={`${brand.name} logo`} fill sizes="256px" className="object-contain" />
            </div>
          )}
          <ProductGrid products={products} brandNames={Object.fromEntries(brands.map((b) => [b.slug, b.name]))} emptyTitle="Collection Coming Soon" />
        </div>
      </section>
    </>
  );
}
