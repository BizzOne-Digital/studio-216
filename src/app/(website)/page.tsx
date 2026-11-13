import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedMerch } from "@/components/home/FeaturedMerch";
import { AboutSection } from "@/components/home/AboutSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { OfferCards } from "@/components/home/OfferCards";
import { TestimonialList } from "@/components/home/TestimonialList";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { FinalCta } from "@/components/home/FinalCta";
import { ProductCard } from "@/components/products/ProductCard";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getBrands, getCategories, getFaqs, getFeaturedBrands, getGallery, getHomeContent, getProducts, getPromotions, getTestimonials } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [home, featuredBrands, brands, categories, promotions, products, gallery, testimonials, faqs] = await Promise.all([
    getHomeContent(),
    getFeaturedBrands(),
    getBrands(),
    getCategories(),
    getPromotions(),
    getProducts({ featured: true, limit: 8 }),
    getGallery(),
    getTestimonials(),
    getFaqs(),
  ]);
  const brandName = new Map(brands.map((b) => [b.slug, b.name]));

  return (
    <>
      <Hero hero={home.hero} />
      <ServicesPreview cards={home.servicesPreview.cards} />
      <FeaturedMerch content={home.featuredMerch} brands={featuredBrands} />
      <AboutSection about={home.about} />

      {/* What we create */}
      <section aria-labelledby="create-heading" className="brushed py-20 lg:py-28">
        <div className="container">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <SectionHeading eyebrow="Products" title={home.categories.heading} description={home.categories.description} />
            </Reveal>
            <LinkButton href="/request-quote" variant="outline" arrow>
              Start a Custom Project
            </LinkButton>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Process */}
      <section aria-labelledby="process-heading" className="relative overflow-hidden border-y border-white/5 bg-charcoal py-20 lg:py-28">
        <div className="container">
          <Reveal>
            <SectionHeading eyebrow="How it works" title={home.process.heading} align="center" />
          </Reveal>
          <ProcessSteps steps={home.process.steps} note={home.process.note} />
        </div>
      </section>

      {/* Offers */}
      {promotions.length > 0 && (
        <section aria-labelledby="offers-heading" className="paper py-20 text-ink lg:py-24">
          <div className="container">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <Reveal>
                <SectionHeading eyebrow="Promotions" title={home.offers.heading} description={home.offers.description} tone="light" />
              </Reveal>
              <Link href={home.offers.cta.href} className="group inline-flex h-12 items-center gap-2 rounded-lg bg-ink px-6 text-sm font-bold text-white transition hover:-translate-y-0.5">
                {home.offers.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <OfferCards promotions={promotions} />
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section aria-labelledby="products-heading" className="brushed py-20 lg:py-28">
          <div className="container">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <Reveal>
                <SectionHeading eyebrow="Shop" title={home.products.heading} description={home.products.description} />
              </Reveal>
              <LinkButton href="/shop" variant="outline" arrow>
                View All Products
              </LinkButton>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} brandName={brandName.get(p.brand)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section aria-labelledby="gallery-heading" className="bg-ink py-20 lg:py-28">
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <Reveal>
                <SectionHeading eyebrow="Portfolio" title={home.gallery.heading} description={home.gallery.description} />
              </Reveal>
              <LinkButton href="/gallery" variant="outline" arrow>
                View Full Gallery
              </LinkButton>
            </div>
            <GalleryGrid images={gallery} limit={12} />
          </div>
        </section>
      )}

      {/* Testimonials (hidden until real, approved reviews exist) */}
      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials-heading" className="brushed border-t border-white/5 py-20 lg:py-28">
          <div className="container">
            <Reveal className="mb-12">
              <SectionHeading eyebrow="Reviews" title={home.testimonials.heading} align="center" />
            </Reveal>
            <TestimonialList items={testimonials.slice(0, 6)} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="bg-charcoal py-20 lg:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title={home.faq.heading} description="Quick answers about quotes, orders and production." />
            <LinkButton href="/faq" variant="outline" arrow className="mt-8">
              See All FAQs
            </LinkButton>
          </Reveal>
          <FaqAccordion faqs={faqs.slice(0, 7)} />
        </div>
      </section>

      <FinalCta cta={home.finalCta} />
    </>
  );
}
