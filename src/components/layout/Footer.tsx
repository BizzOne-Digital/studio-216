import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { telHref } from "@/lib/utils";
import type { NavLink, SiteSettingsData } from "@/types";

const QUICK: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "Our Team", href: "/team" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
  { label: "Request a Quote", href: "/request-quote" },
  { label: "Custom Order", href: "/custom-order" },
];

export function Footer({ settings, services, brands }: { settings: SiteSettingsData; services: NavLink[]; brands: NavLink[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="brushed grain relative overflow-hidden border-t border-white/10">
      <div aria-hidden className="pointer-events-none absolute -right-24 top-0 h-full w-1/3 -skew-x-[24deg] bg-gradient-to-b from-white/[0.03] to-transparent" />
      <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] lg:py-20">
        <div>
          <Logo src={settings.logo} name={settings.companyName} />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">{settings.footer.description}</p>
          <SocialIcons social={settings.social} className="mt-6" />
        </div>
        <FooterCol title="Quick Links" links={QUICK} />
        <FooterCol title="Services" links={services.slice(0, 8)} />
        <FooterCol title="Featured Brands" links={[{ label: "Shop All Merch", href: "/shop" }, ...brands]} />
        <div>
          <h3 className="font-display text-lg font-bold uppercase italic tracking-wide">Contact</h3>
          <ul className="mt-5 space-y-4 text-sm text-white/70">
            <li>
              <a href={telHref(settings.phone)} className="flex items-start gap-3 transition hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all transition hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {settings.location}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {settings.footer.copyright}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold uppercase italic tracking-wide">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-sm text-white/60">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
