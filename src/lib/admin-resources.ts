import "server-only";
import type { Model } from "mongoose";
import type { ZodTypeAny } from "zod";
import { Brand, FAQ, GalleryImage, Product, ProductCategory, Promotion, Service, TeamMember, Testimonial } from "@/models/content";
import { ContactInquiry, Order, QuoteRequest } from "@/models/submissions";
import {
  brandSchema,
  categorySchema,
  faqSchema,
  gallerySchema,
  inquiryUpdateSchema,
  orderUpdateSchema,
  productSchema,
  promotionSchema,
  quoteUpdateSchema,
  serviceSchema,
  teamSchema,
  testimonialSchema,
} from "@/lib/validations";

export interface ResourceDef {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  /** Schema for create; update uses .partial() of the same schema. */
  schema: ZodTypeAny;
  /** Submissions cannot be created by admins, only updated. */
  canCreate: boolean;
  searchFields: string[];
  defaultSort: Record<string, 1 | -1>;
  /** Field filters allowed from the query string. */
  filters: string[];
}

export const RESOURCES: Record<string, ResourceDef> = {
  services: { model: Service, schema: serviceSchema, canCreate: true, searchFields: ["title", "slug"], defaultSort: { order: 1, createdAt: 1 }, filters: ["published"] },
  products: { model: Product, schema: productSchema, canCreate: true, searchFields: ["name", "slug", "sku"], defaultSort: { order: 1, createdAt: -1 }, filters: ["published", "category", "brand", "featured"] },
  categories: { model: ProductCategory, schema: categorySchema, canCreate: true, searchFields: ["name", "slug"], defaultSort: { order: 1 }, filters: ["published"] },
  brands: { model: Brand, schema: brandSchema, canCreate: true, searchFields: ["name", "slug"], defaultSort: { order: 1 }, filters: ["published", "featured"] },
  gallery: { model: GalleryImage, schema: gallerySchema, canCreate: true, searchFields: ["caption", "category"], defaultSort: { order: 1, createdAt: -1 }, filters: ["published", "category"] },
  testimonials: { model: Testimonial, schema: testimonialSchema, canCreate: true, searchFields: ["name", "text"], defaultSort: { order: 1, createdAt: -1 }, filters: ["published"] },
  faqs: { model: FAQ, schema: faqSchema, canCreate: true, searchFields: ["question", "answer"], defaultSort: { order: 1 }, filters: ["published", "group"] },
  team: { model: TeamMember, schema: teamSchema, canCreate: true, searchFields: ["name", "role"], defaultSort: { order: 1 }, filters: ["published"] },
  promotions: { model: Promotion, schema: promotionSchema, canCreate: true, searchFields: ["title"], defaultSort: { order: 1 }, filters: ["active"] },
  orders: { model: Order, schema: orderUpdateSchema, canCreate: false, searchFields: ["reference", "customer.name", "customer.email"], defaultSort: { createdAt: -1 }, filters: ["status"] },
  quotes: { model: QuoteRequest, schema: quoteUpdateSchema, canCreate: false, searchFields: ["reference", "name", "email", "productType"], defaultSort: { createdAt: -1 }, filters: ["status", "type"] },
  inquiries: { model: ContactInquiry, schema: inquiryUpdateSchema, canCreate: false, searchFields: ["name", "email", "subject"], defaultSort: { createdAt: -1 }, filters: ["status"] },
};

export function getResource(name: string) {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}
