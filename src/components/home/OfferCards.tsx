import { Icon } from "@/components/ui/Icon";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import type { PromotionDTO } from "@/types";

export function OfferCards({ promotions }: { promotions: PromotionDTO[] }) {
  return (
    <Stagger className="grid gap-5 md:grid-cols-3" gap={0.12}>
      {promotions.map((p) => (
        <RevealItem key={p._id}>
          <article className="group relative h-full overflow-hidden rounded-2xl bg-ink p-7 ring-1 ring-black/10 transition duration-500 hover:-translate-y-1 sm:p-8">
            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.05] transition-transform duration-700 group-hover:scale-150" />
            <div aria-hidden className="absolute bottom-0 left-0 h-1 w-full bg-[linear-gradient(90deg,#fff,#6b6b6b,#fff)]" />
            <div className="flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-ink">
                <Icon name={p.icon} className="h-7 w-7" strokeWidth={1.6} />
              </span>
              {p.badge && <span className="rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-silver">{p.badge}</span>}
            </div>
            <h3 className="display mt-7 text-[2.1rem] text-white">{p.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75">{p.description}</p>
            {p.eligibility && <p className="mt-4 border-t border-white/10 pt-4 text-xs text-white/50">{p.eligibility}</p>}
          </article>
        </RevealItem>
      ))}
    </Stagger>
  );
}
