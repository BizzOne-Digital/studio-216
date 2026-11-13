import { Quote, Star } from "lucide-react";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import type { TestimonialDTO } from "@/types";

export function TestimonialList({ items }: { items: TestimonialDTO[] }) {
  return (
    <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
      {items.map((t) => (
        <RevealItem key={t._id}>
          <figure className="metal-border relative flex h-full flex-col rounded-2xl p-7">
            <Quote className="absolute right-6 top-6 h-10 w-10 text-white/10" aria-hidden />
            <div className="flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={i < t.rating ? "h-4 w-4 fill-white text-white" : "h-4 w-4 text-white/25"} aria-hidden />
              ))}
            </div>
            <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-white/85">&ldquo;{t.text}&rdquo;</blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              {t.image ? (
                <span className="relative h-11 w-11 overflow-hidden rounded-full">
                  <SafeImage src={t.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-lg font-black text-ink">{t.name.charAt(0)}</span>
              )}
              <span>
                <span className="block text-sm font-bold">{t.name}</span>
                {t.role && <span className="block text-xs text-white/55">{t.role}</span>}
              </span>
            </figcaption>
          </figure>
        </RevealItem>
      ))}
    </Stagger>
  );
}
