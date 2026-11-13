import { Icon } from "@/components/ui/Icon";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import type { HomeContent } from "@/types";

export function ProcessSteps({ steps, note }: { steps: HomeContent["process"]["steps"]; note: string }) {
  return (
    <>
      <Stagger className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" gap={0.12}>
        <div aria-hidden className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-[linear-gradient(90deg,transparent,#c0c0c0_15%,#c0c0c0_85%,transparent)] opacity-40 lg:block" />
        {steps.map((s, i) => (
          <RevealItem key={s.title} className="relative text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ink">
              <div className="metal-border absolute inset-0 rounded-full" />
              <Icon name={s.icon} className="relative h-8 w-8 text-white" strokeWidth={1.4} />
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white font-display text-sm font-black text-ink">{i + 1}</span>
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold uppercase italic">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/65">{s.description}</p>
          </RevealItem>
        ))}
      </Stagger>
      <p className="mx-auto mt-12 max-w-2xl rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm text-white/70">{note}</p>
    </>
  );
}
