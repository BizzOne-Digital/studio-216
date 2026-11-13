import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import type { HomeContent } from "@/types";

export function AboutSection({ about }: { about: HomeContent["about"] }) {
  return (
    <section aria-labelledby="about-heading" className="relative overflow-hidden bg-ink">
      <div className="grid lg:grid-cols-2">
        <Reveal className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[560px]">
          <SafeImage src={about.image} alt="Studio 216 production workspace" fill sizes="(min-width:1024px) 50vw, 100vw" className="mono-img object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink" />
          <div aria-hidden className="absolute bottom-8 left-8 hidden rounded-lg border border-white/20 bg-ink/70 px-5 py-4 backdrop-blur sm:block">
            <p className="eyebrow text-[10px]">Proudly serving</p>
            <p className="mt-1 font-display text-2xl font-bold uppercase italic">Tucker · Decatur · Metro ATL</p>
          </div>
        </Reveal>
        <div className="brushed relative flex items-center px-4 py-16 sm:px-10 lg:px-16 xl:px-24">
          <div aria-hidden className="absolute right-0 top-0 h-full w-24 -skew-x-12 bg-white/[0.02]" />
          <Reveal className="relative max-w-xl">
            <p className="eyebrow mb-4">About Studio 216</p>
            <h2 id="about-heading" className="display text-5xl sm:text-6xl xl:text-7xl">
              {about.heading.split(". ").map((part, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "text-metal block" : "block"}>
                  {part}
                  {i < arr.length - 1 ? "." : ""}
                </span>
              ))}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/75 sm:text-[17px]">{about.body}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {about.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <LinkButton href={about.cta.href} arrow size="lg" className="mt-10">
              {about.cta.label}
            </LinkButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
