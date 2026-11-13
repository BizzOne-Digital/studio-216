"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import type { HomeContent } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ hero }: { hero: HomeContent["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, reduce ? 1.02 : 1.08]);

  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } });

  return (
    <section ref={ref} className="grain relative overflow-hidden border-b border-white/5 bg-ink lg:brushed" aria-labelledby="hero-title">
      {/* diagonal accent streaks (desktop only — on mobile they read as stray bands) */}
      <div aria-hidden className="pointer-events-none absolute -left-20 bottom-10 hidden h-40 w-[55%] -rotate-[14deg] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent lg:block" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 hidden h-24 w-40 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.18)_0_2px,transparent_2px_6px)] opacity-40 [mask-image:linear-gradient(45deg,#000,transparent)] lg:block" />

      <div className="relative grid lg:min-h-[600px] lg:grid-cols-[42%_58%] xl:min-h-[640px]">
        {/* Image (right on desktop, top on mobile) */}
        <div className="relative order-1 h-[400px] overflow-hidden [mask-image:linear-gradient(180deg,#000_50%,transparent_100%)] sm:h-[480px] lg:order-2 lg:-ml-[14%] lg:h-auto lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_30%)]">
          <motion.div style={{ y, scale }} className="absolute -inset-y-6 inset-x-0">
            <SafeImage src={hero.mobileImage || hero.image} alt="Custom branded apparel and merchandise" fill priority sizes="100vw" className="mono-img object-cover lg:hidden" />
            <SafeImage src={hero.image} alt="Custom branded apparel and merchandise" fill priority sizes="58vw" className="mono-img hidden object-cover lg:block" />
          </motion.div>
          {/* subtle production-light glow */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(40%_45%_at_30%_18%,rgba(124,92,255,0.22),transparent_70%),radial-gradient(30%_40%_at_92%_30%,rgba(110,90,255,0.18),transparent_70%)] mix-blend-screen" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30 lg:bg-[linear-gradient(90deg,#090909_0%,#090909_14%,rgba(9,9,9,0.55)_32%,rgba(9,9,9,0.05)_55%,rgba(9,9,9,0.35)_85%,#090909_100%)]" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_90%_at_60%_45%,transparent_45%,rgba(9,9,9,0.75)_100%)]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
        </div>

        {/* Copy */}
        <div className="relative z-10 order-2 -mt-32 px-5 pb-12 sm:px-8 lg:order-1 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:py-16 lg:pl-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))] lg:pr-0">
          <h1 id="hero-title" className="relative">
            <motion.span {...fade(0.1)} className="block font-sans text-[1.7rem] font-extrabold italic leading-tight tracking-tight text-white sm:text-4xl xl:text-[2.75rem]">
              {hero.eyebrow}
            </motion.span>
            <motion.span
              initial={reduce ? undefined : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={reduce ? undefined : { opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.1, delay: 0.35, ease }}
              className="relative -ml-2 block w-fit pr-6"
            >
              <span className="text-metal-brush block -rotate-[6deg] py-2 pr-4 font-brush text-[6rem] leading-[1.1] sm:text-[8rem] xl:text-[9.5rem]">{hero.headline}</span>
              <svg aria-hidden viewBox="0 0 520 40" className="absolute -bottom-1 left-0 w-[96%] text-white/90" preserveAspectRatio="none">
                <path d="M4 30 C 140 12, 330 8, 516 14 L 512 20 C 330 16, 150 22, 8 36 Z" fill="currentColor" />
              </svg>
            </motion.span>
          </h1>

          <motion.p {...fade(0.7)} className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-[17px]">
            {hero.description}
          </motion.p>

          <motion.div {...fade(0.85)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href={hero.primaryCta.href} className={buttonClass("silver", "lg", "w-full sm:w-auto")}>
              {hero.primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href={hero.secondaryCta.href} className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
              <ShoppingCart className="h-[18px] w-[18px]" aria-hidden />
              {hero.secondaryCta.label}
            </Link>
          </motion.div>

          <motion.ul {...fade(1)} className="mt-10 grid max-w-xl grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-white/15">
            {hero.features.map((f) => (
              <li key={f.label} className="flex flex-col items-center px-2 text-center">
                <Icon name={f.icon} className="h-8 w-8 text-white" strokeWidth={1.4} />
                <span className="mt-2 text-[11.5px] font-semibold leading-tight text-white/90">{f.label}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
