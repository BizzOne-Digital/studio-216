import type { MetadataRoute } from "next";
import { getBrands, getCategories, getProducts, getServices } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const statics = ["", "/about", "/services", "/shop", "/pricing", "/team", "/testimonials", "/faq", "/gallery", "/contact", "/request-quote", "/custom-order", "/privacy-policy", "/terms"];
  const [services, products, brands, categories] = await Promise.all([getServices(), getProducts({ limit: 100 }), getBrands(), getCategories()]);
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...brands.map((b) => ({ url: `${base}/brands/${b.slug}`, priority: 0.6 })),
    ...categories.filter((c) => c.ctaType === "products").map((c) => ({ url: `${base}/categories/${c.slug}`, priority: 0.6 })),
  ];
}
