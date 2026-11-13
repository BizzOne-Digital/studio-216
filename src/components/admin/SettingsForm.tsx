"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import type { SiteSettingsData } from "@/types";
import { AdminPageHeader } from "./AdminShell";
import { inputCls, labelCls } from "./fields";
import { LocalImageField } from "./LocalImageField";

type Section = "all" | "header-footer";

export function SettingsForm({ section = "all" }: { section?: Section }) {
  const [s, setS] = useState<SiteSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<SiteSettingsData>("/api/admin/settings").then(setS).catch((e) => toast.error((e as Error).message));
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      setS(await api<SiteSettingsData>("/api/admin/settings", { method: "PUT", json: s }));
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!s) return <Loader2 className="mx-auto mt-16 h-6 w-6 animate-spin" />;

  const text = (label: string, value: string, onChange: (v: string) => void, opts?: { long?: boolean; placeholder?: string; help?: string }) => (
    <label className={opts?.long ? "sm:col-span-2" : undefined}>
      <span className={labelCls}>{label}</span>
      {opts?.long ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} /> : <input value={value} placeholder={opts?.placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />}
      {opts?.help && <span className="mt-1 block text-[11px] text-white/40">{opts.help}</span>}
    </label>
  );
  const card = (title: string, children: React.ReactNode) => (
    <section className="rounded-xl border border-white/10 bg-ink p-5 sm:p-6">
      <h2 className="display mb-5 text-2xl">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
  const up = (patch: Partial<SiteSettingsData>) => setS({ ...s, ...patch });

  return (
    <div>
      <AdminPageHeader
        title={section === "all" ? "Website Settings" : "Header & Footer"}
        description={section === "all" ? "Business details, logo, social links and SEO." : "Logo, header button, contact bar, social icons and footer text."}
        actions={
          <button onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
          </button>
        }
      />
      <div className="space-y-5">
        {section === "all" &&
          card(
            "Business",
            <>
              {text("Company name", s.companyName, (v) => up({ companyName: v }))}
              {text("Tagline", s.tagline, (v) => up({ tagline: v }))}
              {text("Phone", s.phone, (v) => up({ phone: v }))}
              {text("Email", s.email, (v) => up({ email: v }))}
              {text("Business location", s.location, (v) => up({ location: v }), { long: true })}
            </>
          )}
        {card(
          "Branding",
          <>
            <LocalImageField label="Logo (PNG with transparent background recommended)" value={s.logo} onChange={(v) => up({ logo: v })} folder="misc" aspect="aspect-[3/1]" />
            <LocalImageField label="Favicon (square PNG)" value={s.favicon} onChange={(v) => up({ favicon: v })} folder="misc" aspect="aspect-square max-w-[160px]" />
            <p className="text-xs text-white/45 sm:col-span-2">Until a logo is uploaded, the site shows a temporary text-based logo in the brand style.</p>
          </>
        )}
        {card(
          "Header",
          <>
            {text("Header button label", s.headerCta.label, (v) => up({ headerCta: { ...s.headerCta, label: v } }))}
            {text("Header button link", s.headerCta.href, (v) => up({ headerCta: { ...s.headerCta, href: v } }), { placeholder: "/request-quote" })}
          </>
        )}
        {card(
          "Social media",
          <>
            {(["facebook", "instagram", "tiktok", "threads"] as const).map((k) =>
              text(`${k[0].toUpperCase()}${k.slice(1)} URL`, s.social[k], (v) => up({ social: { ...s.social, [k]: v } }), { placeholder: "https://", help: "Leave empty to show a disabled icon." })
            )}
          </>
        )}
        {card(
          "Footer",
          <>
            {text("Footer description", s.footer.description, (v) => up({ footer: { ...s.footer, description: v } }), { long: true })}
            {text("Copyright text (year is added automatically)", s.footer.copyright, (v) => up({ footer: { ...s.footer, copyright: v } }), { long: true })}
          </>
        )}
        {section === "all" &&
          card(
            "SEO",
            <>
              {text("Default page title", s.seo.title, (v) => up({ seo: { ...s.seo, title: v } }), { long: true })}
              {text("Meta description", s.seo.description, (v) => up({ seo: { ...s.seo, description: v } }), { long: true })}
              <LocalImageField label="Social share image (1200×630)" value={s.seo.ogImage} onChange={(v) => up({ seo: { ...s.seo, ogImage: v } })} folder="misc" />
            </>
          )}
      </div>
    </div>
  );
}
