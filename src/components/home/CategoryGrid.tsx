import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import type { CategoryDTO } from "@/types";

export function CategoryGrid({ categories }: { categories: CategoryDTO[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" gap={0.07}>
      {categories.map((c) => {
        const href = c.ctaType === "products" ? `/categories/${c.slug}` : `/request-quote?product=${encodeURIComponent(c.name)}`;
        return (
          <RevealItem key={c._id}>
            <Link href={href} className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-charcoal ring-1 ring-white/10 transition hover:ring-white/40">
              <SafeImage src={c.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="mono-img object-cover transition-transform duration-700 group-hover:scale-110 group-hover:[filter:grayscale(0.4)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="display text-2xl text-white sm:text-[1.9rem]">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-white/70 sm:text-sm">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {c.ctaType === "products" ? "View Products" : "Request Quote"}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </RevealItem>
        );
      })}
    </Stagger>
  );
}
