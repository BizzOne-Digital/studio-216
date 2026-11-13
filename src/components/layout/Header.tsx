"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Mail, Menu, Phone, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { useCart } from "@/hooks/useCart";
import { cn, telHref } from "@/lib/utils";
import type { NavLink, SiteSettingsData } from "@/types";

interface NavItem {
  label: string;
  href: string;
  children?: NavLink[];
}

export function Header({ settings, services, merch }: { settings: SiteSettingsData; services: NavLink[]; merch: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nav: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services", children: [{ label: "All Services", href: "/services" }, ...services] },
    { label: "Premade Merch", href: "/shop", children: merch },
    { label: "Pricing", href: "/pricing" },
    { label: "Our Team", href: "/team" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setMenu(null));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };

  return (
    <header className={cn("sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md transition-shadow", scrolled && "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.9)]")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="container flex items-center gap-6">
        <div className={cn("py-2 transition-all duration-300 lg:py-2.5", scrolled && "lg:py-1.5")}>
          <Logo src={settings.logo} name={settings.companyName} />
        </div>

        <div className="hidden flex-1 flex-col lg:flex">
          {/* Top contact bar */}
          <div className={cn("flex items-center justify-end gap-6 overflow-hidden border-b border-white/10 text-[13px] text-white/90 transition-all duration-300", scrolled ? "h-0 border-transparent opacity-0" : "h-11 opacity-100")}>
            <a href={telHref(settings.phone)} className="flex items-center gap-2 transition hover:text-white">
              <Phone className="h-4 w-4 fill-white/90" strokeWidth={0} aria-hidden />
              {settings.phone}
            </a>
            <span className="h-4 w-px bg-silver/30" aria-hidden />
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition hover:text-white">
              <Mail className="h-4 w-4" aria-hidden />
              {settings.email}
            </a>
            <span className="h-4 w-px bg-silver/30" aria-hidden />
            <SocialIcons social={settings.social} size="sm" className="gap-2" />
          </div>

          {/* Main nav */}
          <nav aria-label="Main" className="flex h-[72px] items-center justify-end gap-1 xl:gap-2">
            <ul className="flex items-center">
              {nav.map((item) => (
                <li key={item.label} className="relative" onMouseEnter={() => item.children && enter(item.label)} onMouseLeave={() => item.children && leave()}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={cn("relative px-2.5 py-3 text-[13.5px] font-medium text-white/85 transition hover:text-white xl:px-3.5", isActive(item.href) && "font-semibold text-white")}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                      <span className={cn("absolute inset-x-2.5 -bottom-[1px] h-[3px] origin-left rounded-full bg-white transition-transform duration-300 xl:inset-x-3.5", isActive(item.href) ? "scale-x-100" : "scale-x-0")} />
                    </Link>
                    {item.children && (
                      <button
                        type="button"
                        aria-label={`${item.label} menu`}
                        aria-expanded={menu === item.label}
                        aria-haspopup="true"
                        onClick={() => setMenu(menu === item.label ? null : item.label)}
                        className="-ml-2 p-1 text-white/80 hover:text-white"
                      >
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", menu === item.label && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {item.children && menu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="metal-border absolute left-0 top-full z-50 mt-1 w-72 rounded-xl p-2 shadow-2xl"
                      >
                        <ul>
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white">
                                {c.label}
                                <ArrowRight className="h-3.5 w-3.5 opacity-40" aria-hidden />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
            <Link href="/cart" className="relative ml-1 rounded-full p-2.5 text-white/85 transition hover:bg-white/10 hover:text-white" aria-label={`Cart, ${count} items`}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-ink">{count}</span>}
            </Link>
            <Link
              href={settings.headerCta.href}
              className="group ml-3 inline-flex h-11 items-center gap-2 rounded-lg bg-[linear-gradient(180deg,#fff,#e2e2e2)] px-5 text-sm font-bold text-ink shadow-[inset_0_1px_0_#fff] transition hover:-translate-y-0.5"
            >
              {settings.headerCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </nav>
        </div>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link href="/cart" className="relative p-2.5 text-white" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-ink">{count}</span>}
          </Link>
          <button type="button" className="p-2.5 text-white" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 100%)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="brushed absolute inset-x-0 top-full overflow-y-auto border-t border-white/10 lg:hidden"
          >
            <nav aria-label="Mobile" className="container flex min-h-full flex-col py-6">
              <ul className="divide-y divide-white/10">
                {nav.map((item, i) => (
                  <motion.li key={item.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                    {item.children ? (
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-2xl font-bold uppercase italic">
                          {item.label}
                          <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
                        </summary>
                        <ul className="pb-3 pl-3">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className="block py-2.5 text-[15px] text-white/75">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link href={item.href} className={cn("block py-4 font-display text-2xl font-bold uppercase italic", isActive(item.href) ? "text-white" : "text-white/80")}>
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
              <Link href={settings.headerCta.href} className="mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-white font-bold text-ink">
                {settings.headerCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-8 space-y-3 text-sm text-white/80">
                <a href={telHref(settings.phone)} className="flex items-center gap-3">
                  <Phone className="h-4 w-4" /> {settings.phone}
                </a>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 break-all">
                  <Mail className="h-4 w-4 shrink-0" /> {settings.email}
                </a>
                <SocialIcons social={settings.social} className="pt-3" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
