import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import type { HomeContent } from "@/types";

export function FinalCta({ cta }: { cta: HomeContent["finalCta"] }) {
  return (
    <section aria-labelledby="final-cta" className="relative overflow-hidden border-y border-white/10 bg-ink">
      <SafeImage src={cta.image} alt="" fill sizes="100vw" className="mono-img object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div aria-hidden className="absolute -right-10 top-0 h-full w-1/2 -skew-x-[20deg] border-l border-white/10 bg-white/[0.03]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#e7e7e7,transparent)]" />
      <Reveal className="container relative py-20 sm:py-24 lg:py-28">
        <h2 id="final-cta" className="display max-w-4xl text-5xl sm:text-6xl lg:text-[5.5rem]">
          <span className="text-metal">{cta.heading}</span>
        </h2>
        <p className="mt-5 max-w-xl text-lg text-white/80">{cta.description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href={cta.primary.href} className={buttonClass("silver", "lg")}>
            {cta.primary.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link href={cta.secondary.href} className={buttonClass("outline", "lg")}>
            <MessageSquare className="h-4 w-4" aria-hidden />
            {cta.secondary.label}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
