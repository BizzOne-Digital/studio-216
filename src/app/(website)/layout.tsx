import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/hooks/useCart";
import { getBrands, getCategories, getServices, getSettings } from "@/lib/data";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, brands, categories] = await Promise.all([getSettings(), getServices(), getBrands(), getCategories()]);
  const serviceLinks = services.map((s) => ({ label: s.title, href: `/services/${s.slug}` }));
  const brandLinks = brands.map((b) => ({ label: b.name, href: `/brands/${b.slug}` }));
  const merchLinks = [
    { label: "Shop All Merch", href: "/shop" },
    ...brandLinks,
    ...categories.filter((c) => c.ctaType === "products").map((c) => ({ label: c.name, href: `/categories/${c.slug}` })),
    { label: "Custom Order", href: "/custom-order" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.companyName,
    telephone: settings.phone,
    email: settings.email,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    areaServed: ["Tucker, GA", "Decatur, GA", "Metro Atlanta, GA"],
    address: { "@type": "PostalAddress", addressLocality: "Tucker", addressRegion: "GA", addressCountry: "US" },
    sameAs: Object.values(settings.social).filter(Boolean),
  };

  return (
    <CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Header settings={settings} services={serviceLinks} merch={merchLinks} />
      <main id="main">{children}</main>
      <Footer settings={settings} services={serviceLinks} brands={brandLinks} />
    </CartProvider>
  );
}
