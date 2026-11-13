import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/home/FinalCta";
import { ServiceCard } from "@/components/home/ServicesPreview";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { buttonClass } from "@/components/ui/Button";
import { getHomeContent, getServiceBySlug, getServices } from "@/lib/data";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getServiceBySlug((await params).slug);
  if (!s) return { title: "Service not found" };
  return {
    title: s.title,
    description: s.shortDescription || s.description.slice(0, 160),
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: s.heroImage ? [s.heroImage] : undefined },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, all, home] = await Promise.all([getServiceBySlug(slug), getServices(), getHomeContent()]);
  if (!service) notFound();
  const others = all.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero title={service.title} subtitle={service.shortDescription} image={service.heroImage} crumbs={[{ label: "Services", href: "/services" }, { label: service.title }]} />
      <section className="brushed py-20 lg:py-24">
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <SectionHeading eyebrow="Overview" title="About This Service" />
            <p className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-white/75">{service.description}</p>
            {service.benefits.length > 0 && (
              <>
                <h2 className="display mt-12 text-3xl">Benefits</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 rounded-lg bg-white/[0.04] p-4 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Reveal>
          <Reveal>
            <aside className="metal-border sticky top-40 rounded-2xl p-7">
              <h2 className="display text-3xl">Suitable Products</h2>
              <ul className="mt-5 space-y-2.5 text-sm text-white/80">
                {service.suitableProducts.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                    <span className="h-1.5 w-1.5 rotate-45 bg-white" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
              <Link href={`/request-quote?service=${encodeURIComponent(service.title)}`} className={buttonClass("silver", "lg", "mt-7 w-full")}>
                Request a Quote <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/contact" className={buttonClass("ghost", "md", "mt-2 w-full")}>
                Have a question? Contact us
              </Link>
            </aside>
          </Reveal>
        </div>
      </section>

      {service.gallery.length > 0 && (
        <section className="bg-ink py-16">
          <div className="container">
            <SectionHeading title="Recent Work" />
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {service.gallery.map((g, i) => (
                <div key={g + i} className="relative aspect-square overflow-hidden rounded-lg">
                  <SafeImage src={g} alt={`${service.title} example ${i + 1}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-charcoal py-16 lg:py-20">
        <div className="container">
          <SectionHeading title="More Services" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <ServiceCard key={s._id} title={s.title} description={s.shortDescription} icon={s.icon} image={s.heroImage} href={`/services/${s.slug}`} />
            ))}
          </div>
        </div>
      </section>
      <FinalCta cta={home.finalCta} />
    </>
  );
}
