import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import { getBrands, getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

async function findCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await findCategory((await params).slug);
  if (!c) return { title: "Category not found" };
  return { title: c.name, description: c.description, alternates: { canonical: `/categories/${c.slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();
  const [products, brands] = await Promise.all([getProducts({ category: slug, limit: 100 }), getBrands()]);
  return (
    <>
      <PageHero title={category.name} subtitle={category.description} image={category.image} crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
      <section className="brushed py-14 lg:py-16">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/60">{products.length} products</p>
            <LinkButton href={`/request-quote?product=${encodeURIComponent(category.name)}`} variant="outline" size="sm" arrow>
              Request a custom quote
            </LinkButton>
          </div>
          <ProductGrid products={products} brandNames={Object.fromEntries(brands.map((b) => [b.slug, b.name]))} />
        </div>
      </section>
    </>
  );
}
