"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Opt {
  label: string;
  value: string;
}

export function ShopFilters({ categories, brands, sizes, colors }: { categories: Opt[]; brands: Opt[]; sizes: string[]; colors: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) set("q", q.trim());
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["category", "brand", "size", "color", "q"].filter((k) => params.get(k)).length;

  const Select = ({ k, label, options }: { k: string; label: string; options: Opt[] }) =>
    options.length ? (
      <label className="block">
        <span className="field-label">{label}</span>
        <select className="field" value={params.get(k) ?? ""} onChange={(e) => set(k, e.target.value)}>
          <option value="">All</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  return (
    <div className={cn("transition-opacity", pending && "opacity-70")}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merch..." className="field h-12 pl-11" />
        </label>
        <label className="sm:w-56">
          <span className="sr-only">Sort</span>
          <select className="field h-12" value={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)}>
            <option value="">Featured</option>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-sm font-semibold lg:hidden">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters {active > 0 && `(${active})`}
        </button>
      </div>
      <div className={cn("mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", !open && "hidden lg:grid")}>
        <Select k="category" label="Category" options={categories} />
        <Select k="brand" label="Featured brand" options={brands} />
        <Select k="size" label="Size" options={sizes.map((s) => ({ label: s, value: s }))} />
        <Select k="color" label="Color" options={colors.map((s) => ({ label: s, value: s }))} />
      </div>
      {active > 0 && (
        <button type="button" onClick={() => (setQ(""), start(() => router.replace(pathname, { scroll: false })))} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white">
          <X className="h-3.5 w-3.5" aria-hidden /> Clear all filters
        </button>
      )}
    </div>
  );
}
