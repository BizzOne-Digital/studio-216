import mongoose, { Schema, type Model } from "mongoose";

/* ---------- SiteSettings (single doc, key "main") ---------- */
export interface ISiteSettings {
  key: string;
  data: Record<string, unknown>;
}
const SiteSettingsSchema = new Schema<ISiteSettings>(
  { key: { type: String, required: true, unique: true }, data: { type: Schema.Types.Mixed, default: {} } },
  { timestamps: true, minimize: false }
);
export const SiteSettings: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

/* ---------- PageContent (keyed by page) ---------- */
export interface IPageContent {
  page: string;
  data: Record<string, unknown>;
  published: boolean;
}
const PageContentSchema = new Schema<IPageContent>(
  {
    page: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);
export const PageContent: Model<IPageContent> =
  (mongoose.models.PageContent as Model<IPageContent>) || mongoose.model<IPageContent>("PageContent", PageContentSchema);

/* ---------- Service ---------- */
export interface IService {
  title: string;
  slug: string;
  icon: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  benefits: string[];
  suitableProducts: string[];
  gallery: string[];
  order: number;
  featured: boolean;
  published: boolean;
}
const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: "Sparkles" },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    benefits: { type: [String], default: [] },
    suitableProducts: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);
ServiceSchema.index({ published: 1, order: 1 });
export const Service: Model<IService> = (mongoose.models.Service as Model<IService>) || mongoose.model<IService>("Service", ServiceSchema);

/* ---------- ProductCategory ---------- */
export interface IProductCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  ctaType: "products" | "quote";
  order: number;
  published: boolean;
}
const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    ctaType: { type: String, enum: ["products", "quote"], default: "quote" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const ProductCategory: Model<IProductCategory> =
  (mongoose.models.ProductCategory as Model<IProductCategory>) ||
  mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);

/* ---------- Brand ---------- */
export interface IBrand {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  featured: boolean;
  order: number;
  published: boolean;
}
const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, default: "Collection" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Brand: Model<IBrand> = (mongoose.models.Brand as Model<IBrand>) || mongoose.model<IBrand>("Brand", BrandSchema);

/* ---------- Product ---------- */
export interface IProduct {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  sku: string;
  price?: number | null;
  compareAtPrice?: number | null;
  sizes: string[];
  colors: string[];
  material: string;
  customizationOptions: string[];
  stock?: number | null;
  availability: "in_stock" | "made_to_order" | "out_of_stock";
  featured: boolean;
  published: boolean;
  order: number;
}
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, default: "", index: true },
    brand: { type: String, default: "", index: true },
    images: { type: [String], default: [] },
    sku: { type: String, default: "" },
    price: { type: Number, default: null, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    material: { type: String, default: "" },
    customizationOptions: { type: [String], default: [] },
    stock: { type: Number, default: null },
    availability: { type: String, enum: ["in_stock", "made_to_order", "out_of_stock"], default: "made_to_order" },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ProductSchema.index({ published: 1, featured: 1, order: 1 });
export const Product: Model<IProduct> = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);

/* ---------- GalleryImage ---------- */
export const GALLERY_CATEGORIES = ["Embroidery", "Apparel Printing", "DTF Transfers", "Promotional Items", "Signage", "Custom Merchandise"];
export interface IGalleryImage {
  image: string;
  caption: string;
  category: string;
  order: number;
  published: boolean;
}
const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    category: { type: String, default: "Custom Merchandise" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const GalleryImage: Model<IGalleryImage> =
  (mongoose.models.GalleryImage as Model<IGalleryImage>) || mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);

/* ---------- Testimonial ---------- */
export interface ITestimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  image: string;
  order: number;
  published: boolean;
}
const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Testimonial: Model<ITestimonial> =
  (mongoose.models.Testimonial as Model<ITestimonial>) || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

/* ---------- FAQ ---------- */
export interface IFAQ {
  question: string;
  answer: string;
  group: string;
  order: number;
  published: boolean;
}
const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    group: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const FAQ: Model<IFAQ> = (mongoose.models.FAQ as Model<IFAQ>) || mongoose.model<IFAQ>("FAQ", FAQSchema);

/* ---------- TeamMember ---------- */
export interface ITeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  order: number;
  published: boolean;
}
const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const TeamMember: Model<ITeamMember> =
  (mongoose.models.TeamMember as Model<ITeamMember>) || mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

/* ---------- Promotion (display only; never auto-applied to totals) ---------- */
export interface IPromotion {
  title: string;
  badge: string;
  description: string;
  eligibility: string;
  icon: string;
  order: number;
  active: boolean;
}
const PromotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    icon: { type: String, default: "BadgePercent" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Promotion: Model<IPromotion> =
  (mongoose.models.Promotion as Model<IPromotion>) || mongoose.model<IPromotion>("Promotion", PromotionSchema);
