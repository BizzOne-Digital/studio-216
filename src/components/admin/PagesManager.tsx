"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentEditor, type ContentEditorProps } from "./ContentEditor";

const PAGES: { key: ContentEditorProps["page"]; label: string; href: string; description: string }[] = [
  { key: "about", label: "About Us", href: "/about", description: "Story, mission, vision, why choose us and workshop images." },
  { key: "pricing", label: "Pricing", href: "/pricing", description: "Pricing heading, intro and pricing factors." },
  { key: "privacy", label: "Privacy Policy", href: "/privacy-policy", description: "Blank lines separate sections. A short first line becomes a heading." },
  { key: "terms", label: "Terms & Conditions", href: "/terms", description: "Blank lines separate sections. A short first line becomes a heading." },
];

export function PagesManager() {
  const [active, setActive] = useState(PAGES[0]);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p.key} onClick={() => setActive(p)} className={cn("rounded-lg px-4 py-2.5 text-sm font-semibold", active.key === p.key ? "bg-white text-ink" : "border border-white/15 text-white/75 hover:text-white")}>
            {p.label}
          </button>
        ))}
      </div>
      <ContentEditor key={active.key} page={active.key} title={active.label} description={active.description} previewHref={active.href} />
      <p className="mt-6 text-xs text-white/40">Services, shop, FAQ, team, testimonials and gallery pages are managed from their own sections in the sidebar.</p>
    </div>
  );
}
