import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { getSettings } from "@/lib/data";
import { telHref } from "@/lib/utils";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Studio 216 Print and Design in Tucker / Decatur, GA. Call 470-746-0951 or send us a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const items = [
    { icon: Phone, label: "Call us", value: s.phone, href: telHref(s.phone) },
    { icon: Mail, label: "Email us", value: s.email, href: `mailto:${s.email}` },
    { icon: MapPin, label: "Location", value: s.location },
  ];
  return (
    <>
      <PageHero title="Contact Us" subtitle="Questions, ideas or a project in mind? We'd love to hear from you." crumbs={[{ label: "Contact" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container grid gap-10 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            {items.map(({ icon: I, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-ink">
                  <I className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow text-[10px]">{label}</p>
                  {href ? (
                    <a href={href} className="mt-1 block break-all text-[15px] font-semibold hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[15px] font-semibold">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="eyebrow mb-3 text-[10px]">Follow @studio216printanddesign</p>
              <SocialIcons social={s.social} />
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
