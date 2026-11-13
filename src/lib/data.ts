import "server-only";
import { cache } from "react";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { toPlain } from "@/lib/utils";
import {
  Brand,
  FAQ,
  GalleryImage,
  PageContent,
  Product,
  ProductCategory,
  Promotion,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/models/content";
import {
  DEFAULT_ABOUT,
  DEFAULT_BRANDS,
  DEFAULT_CATEGORIES,
  DEFAULT_FAQS,
  DEFAULT_HOME,
  DEFAULT_PRICING,
  DEFAULT_PRIVACY,
  DEFAULT_PROMOTIONS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_TERMS,
} from "@/config/defaults";
import type {
  AboutContent,
  BrandDTO,
  CategoryDTO,
  FaqDTO,
  GalleryDTO,
  HomeContent,
  LegalContent,
  PricingContent,
  ProductDTO,
  PromotionDTO,
  ServiceDTO,
  SiteSettingsData,
  TeamDTO,
  TestimonialDTO,
} from "@/types";

/** Deep-merge saved content over defaults so newly added fields always have a value. */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    if (over && typeof over === "object" && !Array.isArray(over)) {
      for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
        out[k] = k in out ? mergeDeep(out[k], v) : v;
      }
    }
    return out as T;
  }
  return (over === undefined || over === null ? base : over) as T;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    await connectDB();
    return await fn();
  } catch (e) {
    console.error("[data] falling back to defaults:", (e as Error).message);
    return fallback;
  }
}

const withIds = <T>(items: readonly T[], prefix: string) =>
  items.map((it, i) => ({ ...it, _id: `${prefix}-${i}`, order: i, published: true, featured: false })) as unknown as (T & { _id: string })[];

export const getSettings = cache(async (): Promise<SiteSettingsData> =>
  safe(async () => {
    const doc = await SiteSettings.findOne({ key: "main" }).lean();
    return mergeDeep(DEFAULT_SETTINGS, doc?.data);
  }, DEFAULT_SETTINGS)
);

async function getPage<T>(page: string, fallback: T): Promise<T> {
  return safe(async () => {
    const doc = await PageContent.findOne({ page }).lean();
    return mergeDeep(fallback, doc?.data);
  }, fallback);
}

export const getHomeContent = cache(() => getPage<HomeContent>("home", DEFAULT_HOME));
export const getAboutContent = cache(() => getPage<AboutContent>("about", DEFAULT_ABOUT));
export const getPricingContent = cache(() => getPage<PricingContent>("pricing", DEFAULT_PRICING));
export const getLegalContent = cache((page: "privacy" | "terms") =>
  getPage<LegalContent>(page, page === "privacy" ? DEFAULT_PRIVACY : DEFAULT_TERMS)
);

const fallbackServices = withIds(
  DEFAULT_SERVICES.map((s) => ({ ...s, gallery: [] as string[] })),
  "svc"
) as unknown as ServiceDTO[];

export const getServices = cache(async (): Promise<ServiceDTO[]> =>
  safe(async () => {
    const items = await Service.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    return items.length ? toPlain<ServiceDTO[]>(items) : fallbackServices;
  }, fallbackServices)
);

export async function getServiceBySlug(slug: string) {
  const all = await getServices();
  return all.find((s) => s.slug === slug) ?? null;
}

const fallbackCategories = withIds(DEFAULT_CATEGORIES, "cat") as unknown as CategoryDTO[];
export const getCategories = cache(async (): Promise<CategoryDTO[]> =>
  safe(async () => {
    const items = await ProductCategory.find({ published: true }).sort({ order: 1 }).lean();
    return items.length ? toPlain<CategoryDTO[]>(items) : fallbackCategories;
  }, fallbackCategories)
);

const fallbackBrands = DEFAULT_BRANDS.map((b, i) => ({ ...b, _id: `brand-${i}`, logo: "", published: true })) as unknown as BrandDTO[];
export const getBrands = cache(async (): Promise<BrandDTO[]> =>
  safe(async () => toPlain<BrandDTO[]>(await Brand.find({ published: true }).sort({ order: 1 }).lean()), fallbackBrands)
);
export async function getFeaturedBrands() {
  const brands = await getBrands();
  const featured = brands.filter((b) => b.featured);
  return (featured.length ? featured : brands).slice(0, 2);
}

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  sort?: string;
  featured?: boolean;
  limit?: number;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductDTO[]> {
  return safe(async () => {
    const filter: Record<string, unknown> = { published: true };
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.size) filter.sizes = query.size;
    if (query.color) filter.colors = query.color;
    if (query.featured) filter.featured = true;
    if (query.q) {
      const rx = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
      filter.$or = [{ name: rx }, { shortDescription: rx }, { description: rx }];
    }
    const sort: Record<string, 1 | -1> =
      query.sort === "price-asc" ? { price: 1 } : query.sort === "price-desc" ? { price: -1 } : query.sort === "newest" ? { createdAt: -1 } : query.sort === "name" ? { name: 1 } : { order: 1, createdAt: -1 };
    const items = await Product.find(filter).sort(sort).limit(Math.min(query.limit ?? 60, 100)).lean();
    return toPlain<ProductDTO[]>(items);
  }, []);
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  return safe(async () => {
    const p = await Product.findOne({ slug, published: true }).lean();
    return p ? toPlain<ProductDTO>(p) : null;
  }, null);
}

export const getProductFacets = cache(async () =>
  safe(async () => {
    const [sizes, colors] = await Promise.all([Product.distinct("sizes", { published: true }), Product.distinct("colors", { published: true })]);
    return { sizes: (sizes as string[]).filter(Boolean).sort(), colors: (colors as string[]).filter(Boolean).sort() };
  }, { sizes: [] as string[], colors: [] as string[] })
);

export const getGallery = cache(async (): Promise<GalleryDTO[]> =>
  safe(async () => toPlain<GalleryDTO[]>(await GalleryImage.find({ published: true }).sort({ order: 1, createdAt: -1 }).limit(200).lean()), [])
);

export const getTestimonials = cache(async (): Promise<TestimonialDTO[]> =>
  safe(async () => toPlain<TestimonialDTO[]>(await Testimonial.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean()), [])
);

const fallbackFaqs = withIds(DEFAULT_FAQS.map((f) => ({ ...f, group: "General" })), "faq") as unknown as FaqDTO[];
export const getFaqs = cache(async (): Promise<FaqDTO[]> =>
  safe(async () => {
    const items = await FAQ.find({ published: true }).sort({ order: 1 }).lean();
    return items.length ? toPlain<FaqDTO[]>(items) : fallbackFaqs;
  }, fallbackFaqs)
);

export const getTeam = cache(async (): Promise<TeamDTO[]> =>
  safe(async () => toPlain<TeamDTO[]>(await TeamMember.find({ published: true }).sort({ order: 1 }).lean()), [])
);

const fallbackPromos = withIds(DEFAULT_PROMOTIONS, "promo").map((p) => ({ ...p, active: true })) as unknown as PromotionDTO[];
export const getPromotions = cache(async (): Promise<PromotionDTO[]> =>
  safe(async () => toPlain<PromotionDTO[]>(await Promotion.find({ active: true }).sort({ order: 1 }).lean()), fallbackPromos)
);
