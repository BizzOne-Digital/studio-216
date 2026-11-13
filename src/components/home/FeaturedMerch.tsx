import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import type { BrandDTO, HomeContent } from "@/types";

export function FeaturedMerch({ content, brands }: { content: HomeContent["featuredMerch"]; brands: BrandDTO[] }) {
  if (!brands.length) return null;
  return (
    <section aria-labelledby="featured-merch" className="brushed grain relative overflow-hidden border-y border-white/5 py-14 lg:py-12">
      <div className="container grid items-center gap-10 lg:grid-cols-[38%_1fr]">
        <Reveal>
          <h2 id="featured-merch" className="font-sans text-5xl font-extrabold italic leading-none tracking-tight text-white sm:text-6xl">
            {content.title}
            <span aria-hidden className="ml-1 inline-block h-2.5 w-24 -skew-x-[40deg] bg-[linear-gradient(90deg,#fff_0_60%,transparent_60%_70%,#fff_70%)] align-baseline sm:w-28" />
          </h2>
          <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-white/80">{content.description}</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
            Shop all merch <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2" gap={0.15}>
          {brands.map((b) => (
            <RevealItem key={b._id}>
              <BrandCard brand={b} />
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function BrandCard({ brand }: { brand: BrandDTO }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      aria-label={`View ${brand.name} collection`}
      className="metal-border group relative flex h-[130px] items-center justify-center overflow-hidden rounded-2xl transition duration-500 [clip-path:polygon(2.5%_0,100%_0,97.5%_100%,0_100%)] hover:-translate-y-1 sm:h-[124px] lg:h-[130px]"
    >
      <SafeImage src={brand.banner} alt="" fill sizes="(min-width:1024px) 28vw, 90vw" className="mono-img object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/80" />
      <div className="relative text-center">
        {brand.logo ? (
          <div className="relative mx-auto h-16 w-48">
            <SafeImage src={brand.logo} alt={brand.name} fill sizes="200px" className="object-contain" />
          </div>
        ) : (
          <p className="display text-4xl font-black text-white drop-shadow-lg sm:text-[2.6rem]">{brand.name}</p>
        )}
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.35em] text-white/85">{brand.tagline || "Collection"}</p>
      </div>
      <span className="absolute bottom-4 right-6 flex h-8 w-11 items-center justify-center rounded-md bg-white text-ink shadow transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
