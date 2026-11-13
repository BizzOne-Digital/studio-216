import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductCard } from "@/components/products/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBrands, getCategories, getProductBySlug, getProducts } from "@/lib/data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.shortDescription || p.description.slice(0, 160),
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: p.images[0] ? [p.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [brands, categories, related] = await Promise.all([
    getBrands(),
    getCategories(),
    getProducts({ category: product.category || undefined, limit: 5 }),
  ]);
  const brandNames = Object.fromEntries(brands.map((b) => [b.slug, b.name]));
  const category = categories.find((c) => c.slug === product.category);
  const others = related.filter((r) => r._id !== product._id).slice(0, 4);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    sku: product.sku || undefined,
    image: product.images.map((i) => (i.startsWith("/") ? site + i : i)),
    brand: brandNames[product.brand] ? { "@type": "Brand", name: brandNames[product.brand] } : undefined,
    offers:
      typeof product.price === "number"
        ? { "@type": "Offer", priceCurrency: "USD", price: product.price, availability: product.availability === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }
        : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="brushed py-10 lg:py-14">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-white/55">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href="/shop" className="hover:text-white">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span aria-current="page" className="text-white/85">
              {product.name}
            </span>
          </nav>
          <ProductDetail product={product} brandName={brandNames[product.brand]} categoryName={category?.name} />
        </div>
      </section>
      {others.length > 0 && (
        <section className="bg-charcoal py-16">
          <div className="container">
            <SectionHeading title="You May Also Like" />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {others.map((p) => (
                <ProductCard key={p._id} product={p} brandName={brandNames[p.brand]} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
