"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  Boxes,
  ExternalLink,
  FileText,
  FolderTree,
  HelpCircle,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelTop,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  UserCog,
  Users,
  Wrench,
  X,
  FileQuestion,
} from "lucide-react";
import { api } from "@/lib/client";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  {
    group: "Website",
    items: [
      { label: "Website Content", href: "/admin/content", icon: LayoutTemplate },
      { label: "Pages Management", href: "/admin/pages", icon: FileText },
      { label: "Hero & Banners", href: "/admin/hero", icon: Sparkles },
      { label: "Header & Footer", href: "/admin/header-footer", icon: PanelTop },
    ],
  },
  {
    group: "Catalog",
    items: [
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Products", href: "/admin/products", icon: Boxes },
      { label: "Product Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Featured Brands", href: "/admin/brands", icon: Tag },
    ],
  },
  {
    group: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Quote Requests", href: "/admin/quotes", icon: FileQuestion },
      { label: "Customer Inquiries", href: "/admin/inquiries", icon: Inbox },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Gallery", href: "/admin/gallery", icon: Images },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Our Team", href: "/admin/team", icon: Users },
      { label: "Offers & Discounts", href: "/admin/promotions", icon: BadgePercent },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Website Settings", href: "/admin/settings", icon: Settings },
      { label: "Admin Account", href: "/admin/account", icon: UserCog },
    ],
  },
];

export function AdminShell({ admin, children }: { admin: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Logo name="Studio 216 Admin" href="/admin" size="sm" className="h-11 w-[70px]" />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link href={it.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition", active ? "bg-white text-ink" : "text-white/70 hover:bg-white/[0.06] hover:text-white")}>
                      <it.icon className="h-4 w-4" aria-hidden />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold">{admin.name}</p>
        <p className="truncate text-xs text-white/45">{admin.email}</p>
        <div className="mt-3 flex gap-2">
          <a href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/15 py-2 text-xs font-semibold hover:border-white/40">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View site
          </a>
          <button onClick={logout} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/15 py-2 text-xs font-semibold hover:border-red-400/60 hover:text-red-300">
            <LogOut className="h-3.5 w-3.5" aria-hidden /> Log out
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-ink lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-ink transition-transform duration-300 lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-ink/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1.5">
            <Menu className="h-6 w-6" />
          </button>
          <Logo name="Studio 216 Admin" href="/admin" size="sm" className="h-10 w-[64px]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Admin</span>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
