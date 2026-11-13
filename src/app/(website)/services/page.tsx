import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/home/FinalCta";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { buttonClass } from "@/components/ui/Button";
import { getHomeContent, getServices } from "@/lib/data";
import { cn } from "@/lib/utils";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Services",
  description: "Custom embroidery, T-shirt printing, DTF transfers, promotional merchandise, UV DTF stickers, banners, event tents, yard signs and branded workwear in Metro Atlanta.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [services, home] = await Promise.all([getServices(), getHomeContent()]);
  return (
    <>
      <PageHero title="Our Services" subtitle="Everything you need to put your brand on apparel, merchandise and signage — produced in one studio." crumbs={[{ label: "Services" }]} />

      {/* Quick index */}
      <nav aria-label="Services list" className="sticky top-[72px] z-30 border-b border-white/10 bg-ink/90 backdrop-blur lg:top-[129px]">
        <ul className="no-scrollbar container flex gap-2 overflow-x-auto py-3">
          {services.map((s) => (
            <li key={s._id}>
              <a href={`#${s.slug}`} className="block whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white hover:text-white">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="brushed">
        {services.map((s, i) => (
          <section key={s._id} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-40 border-b border-white/5 py-16 lg:py-24">
            <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10", i % 2 === 1 && "lg:order-2")}>
                <SafeImage src={s.heroImage} alt={s.title} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <span className="absolute left-5 top-5 font-display text-6xl font-black italic text-white/25">{String(i + 1).padStart(2, "0")}</span>
              </Reveal>
              <Reveal>
                <Icon name={s.icon} className="h-10 w-10 text-white" strokeWidth={1.4} />
                <h2 id={`${s.slug}-title`} className="display mt-4 text-5xl sm:text-6xl">
                  {s.title}
                </h2>
                <p className="mt-5 text-[16px] leading-relaxed text-white/75">{s.description || s.shortDescription}</p>
                {s.benefits.length > 0 && (
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.suitableProducts.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {s.suitableProducts.map((p) => (
                      <span key={p} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/75">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/request-quote?service=${encodeURIComponent(s.title)}`} className={buttonClass("silver")}>
                    Get a Quote <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link href={`/services/${s.slug}`} className={buttonClass("outline")}>
                    Service Details
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>
      <FinalCta cta={home.finalCta} />
    </>
  );
}
