import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

/** Consistent inner-page banner in the hero's brushed-metal style. */
export function PageHero({ title, subtitle, image, crumbs = [] }: { title: string; subtitle?: string; image?: string; crumbs?: { label: string; href?: string }[] }) {
  return (
    <section className="brushed grain relative overflow-hidden border-b border-white/10">
      {image && (
        <>
          <SafeImage src={image} alt="" fill priority sizes="100vw" className="mono-img object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        </>
      )}
      <div aria-hidden className="absolute -left-10 bottom-6 h-24 w-1/2 -rotate-[10deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="container relative py-16 sm:py-20 lg:py-24">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/55">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" aria-hidden />
              {c.href ? (
                <Link href={c.href} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-white/85">
                  {c.label}
                </span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="display max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
          <span className="text-metal">{title}</span>
        </h1>
        {subtitle && <p className="mt-5 max-w-2xl text-base text-white/75 sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
