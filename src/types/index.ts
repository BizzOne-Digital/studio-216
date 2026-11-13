import type {
  IBrand,
  IFAQ,
  IGalleryImage,
  IProduct,
  IProductCategory,
  IPromotion,
  IService,
  ITeamMember,
  ITestimonial,
} from "@/models/content";

export type WithId<T> = T & { _id: string; createdAt?: string; updatedAt?: string };

export type ServiceDTO = WithId<IService>;
export type ProductDTO = WithId<IProduct>;
export type CategoryDTO = WithId<IProductCategory>;
export type BrandDTO = WithId<IBrand>;
export type GalleryDTO = WithId<IGalleryImage>;
export type TestimonialDTO = WithId<ITestimonial>;
export type FaqDTO = WithId<IFAQ>;
export type TeamDTO = WithId<ITeamMember>;
export type PromotionDTO = WithId<IPromotion>;

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteSettingsData {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  location: string;
  logo: string;
  favicon: string;
  social: { facebook: string; instagram: string; tiktok: string; threads: string };
  seo: { title: string; description: string; ogImage: string };
  footer: { description: string; copyright: string };
  headerCta: NavLink;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    image: string;
    mobileImage: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
    features: { icon: string; label: string }[];
  };
  servicesPreview: { slugs: string[]; cards: { title: string; description: string; icon: string; image: string; href: string }[] };
  featuredMerch: { title: string; description: string };
  about: { heading: string; body: string; image: string; highlights: string[]; cta: NavLink };
  categories: { heading: string; description: string };
  process: { heading: string; note: string; steps: { title: string; description: string; icon: string }[] };
  offers: { heading: string; description: string; cta: NavLink };
  products: { heading: string; description: string };
  gallery: { heading: string; description: string };
  testimonials: { heading: string };
  faq: { heading: string };
  finalCta: { heading: string; description: string; image: string; primary: NavLink; secondary: NavLink };
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  story: string;
  mission: string;
  vision: string;
  whyChoose: { title: string; description: string }[];
  workshopImages: string[];
}

export interface LegalContent {
  title: string;
  updated: string;
  body: string;
}

export interface PricingContent {
  heading: string;
  intro: string;
  factors: string[];
}
