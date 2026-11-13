"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqDTO } from "@/types";

export function FaqAccordion({ faqs, searchable = false, grouped = false }: { faqs: FaqDTO[]; searchable?: boolean; grouped?: boolean }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?._id ?? null);
  const [q, setQ] = useState("");
  const id = useId();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? faqs.filter((f) => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s)) : faqs;
  }, [faqs, q]);
  const groups = useMemo(() => {
    if (!grouped) return [["", filtered]] as [string, FaqDTO[]][];
    const m = new Map<string, FaqDTO[]>();
    filtered.forEach((f) => m.set(f.group || "General", [...(m.get(f.group || "General") ?? []), f]));
    return [...m.entries()];
  }, [filtered, grouped]);

  return (
    <div>
      {searchable && (
        <label className="relative mb-8 block">
          <span className="sr-only">Search questions</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions..." className="field h-12 pl-11" />
        </label>
      )}
      {filtered.length === 0 && <p className="py-8 text-center text-white/60">No matching questions. Contact us and we&apos;ll be happy to help.</p>}
      {groups.map(([group, items]) => (
        <div key={group || "all"} className="mb-8 last:mb-0">
          {group && groups.length > 1 && <h3 className="eyebrow mb-4">{group}</h3>}
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {items.map((f) => {
              const isOpen = open === f._id;
              return (
                <li key={f._id}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-${f._id}`}
                      onClick={() => setOpen(isOpen ? null : f._id)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-semibold transition hover:text-white sm:text-base"
                    >
                      {f.question}
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 transition duration-300", isOpen && "rotate-45 border-white bg-white text-ink")}>
                        <Plus className="h-4 w-4" aria-hidden />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`${id}-${f._id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-3xl whitespace-pre-line pb-6 pr-12 text-sm leading-relaxed text-white/70 sm:text-[15px]">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
