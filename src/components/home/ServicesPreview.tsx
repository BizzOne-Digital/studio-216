import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Icon } from "@/components/ui/Icon";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import type { HomeContent } from "@/types";

export function ServicesPreview({ cards }: { cards: HomeContent["servicesPreview"]["cards"] }) {
  return (
    <section aria-label="Our services" className="paper relative overflow-hidden py-8 sm:py-10 lg:py-8">
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(0,0,0,0.025)_0_2px,transparent_2px_9px)]" />
      <Stagger className="container relative grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:gap-5" gap={0.12}>
        {cards.map((c, i) => (
          <RevealItem key={c.title} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
            <ServiceCard {...c} />
          </RevealItem>
        ))}
      </Stagger>
    </section>
  );
}

export function ServiceCard({ title, description, icon, image, href }: HomeContent["servicesPreview"]["cards"][number]) {
  return (
    <Link
      href={href}
      className="group relative flex h-[230px] overflow-hidden rounded-2xl bg-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition duration-500 [clip-path:polygon(1.6%_0,100%_0,98.4%_100%,0_100%)] hover:-translate-y-1 hover:ring-white/40 sm:h-[240px]"
    >
      <div className="absolute inset-y-0 left-0 w-[52%] overflow-hidden">
        <SafeImage src={image} alt="" fill sizes="(min-width:1024px) 16vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink/30 to-ink" />
      </div>
      <div className="relative ml-auto flex w-[54%] flex-col justify-center py-6 pr-6 sm:pr-7">
        <Icon name={icon} className="mb-3 h-8 w-8 text-white" strokeWidth={1.4} />
        <h3 className="font-sans text-[1.35rem] font-extrabold leading-[1.1] text-white xl:text-[1.55rem]">{title}</h3>
        <p className="mt-2.5 text-[13px] leading-snug text-white/80">{description}</p>
        <span className="sr-only">Explore Service</span>
      </div>
      <span className="absolute bottom-5 right-6 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-white text-white transition-all duration-300 group-hover:bg-white group-hover:text-ink" aria-hidden>
        <ArrowRight className="h-4 w-4" />
      </span>
      <span className="absolute bottom-6 right-16 translate-x-2 text-xs font-semibold uppercase tracking-wider text-white/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white/80" aria-hidden>
        Explore Service
      </span>
    </Link>
  );
}
