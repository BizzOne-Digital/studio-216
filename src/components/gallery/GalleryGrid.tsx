"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import type { GalleryDTO } from "@/types";

export function GalleryGrid({ images, limit }: { images: GalleryDTO[]; limit?: number }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(images.map((i) => i.category)))], [images]);
  const [active, setActive] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => {
    const f = active === "All" ? images : images.filter((i) => i.category === active);
    return limit ? f.slice(0, limit) : f;
  }, [images, active, limit]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, list.length]);

  return (
    <div>
      {categories.length > 2 && (
        <div role="tablist" aria-label="Filter gallery" className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition", active === c ? "border-white bg-white text-ink" : "border-white/20 text-white/75 hover:border-white/60")}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <motion.div layout className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {list.map((img, i) => (
            <motion.button
              layout
              key={img._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              onClick={() => setOpen(i)}
              className="group relative mb-3 block w-full overflow-hidden rounded-lg bg-charcoal sm:mb-4"
              aria-label={`Open image${img.caption ? `: ${img.caption}` : ""}`}
            >
              <SafeImage src={img.image} alt={img.caption || img.category} width={600} height={i % 3 === 0 ? 800 : i % 3 === 1 ? 600 : 700} sizes="(min-width:1024px) 25vw, 50vw" className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink to-transparent p-3 text-left text-xs font-medium transition-transform duration-300 group-hover:translate-y-0">
                <span className="block text-[10px] uppercase tracking-widest text-silver">{img.category}</span>
                {img.caption}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setOpen(null)}
          >
            <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 hover:bg-white/20" aria-label="Close" onClick={() => setOpen(null)}>
              <X className="h-6 w-6" />
            </button>
            {list.length > 1 && (
              <>
                <button className="absolute left-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Previous" onClick={(e) => (e.stopPropagation(), setOpen((open - 1 + list.length) % list.length))}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button className="absolute right-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Next" onClick={(e) => (e.stopPropagation(), setOpen((open + 1) % list.length))}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <motion.figure key={list[open]._id} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <SafeImage src={list[open].image} alt={list[open].caption || list[open].category} fill sizes="90vw" className="object-contain" />
              {list[open].caption && <figcaption className="absolute -bottom-8 inset-x-0 text-center text-sm text-white/75">{list[open].caption}</figcaption>}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
