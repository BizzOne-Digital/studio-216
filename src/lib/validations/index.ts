import { z } from "zod";

/* ---------- shared primitives ---------- */
const str = (max = 300) => z.string().trim().max(max);
const req = (label: string, max = 300) => z.string().trim().min(1, `${label} is required`).max(max);
const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^[+()\-.\s0-9]{7,30}$/.test(v), "Enter a valid phone number");
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

/** Image fields accept uploaded images or allowlisted Unsplash placeholders only. */
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/api/uploads/") || /^\/images\/[\w-]+\.(png|jpe?g|webp|gif)$/.test(v) || v.startsWith("https://images.unsplash.com/") || v.startsWith("https://plus.unsplash.com/"),
    "Upload an image or use an approved image URL"
  );
const strList = (max = 40, len = 120) => z.array(z.string().trim().max(len)).max(max).transform((a) => a.filter(Boolean));
const optNum = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v, ctx) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid non-negative number" });
      return z.NEVER;
    }
    return Math.round(n * 100) / 100;
  });
const int = z.coerce.number().int().min(0).max(100000).default(0);
const bool = z.coerce.boolean().default(false);
const attachmentIds = z.array(z.string().regex(/^[a-f0-9]{24}:[a-f0-9]{32}$/)).max(5).default([]);
const optUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Enter a full https:// link");

/* ---------- public forms ---------- */
export const contactSchema = z.object({
  name: req("Full name", 120),
  email,
  phone,
  subject: str(200),
  message: req("Message", 5000),
  website: z.string().max(0).optional(), // honeypot
});
export type ContactInput = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  type: z.enum(["quote", "custom_order"]).default("quote"),
  name: req("Full name", 120),
  email,
  phone: phone.refine((v) => v.length > 0, "Phone is required"),
  company: str(160).default(""),
  service: str(160).default(""),
  productType: req("Product type", 160),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(100000),
  colors: str(300).default(""),
  sizes: str(300).default(""),
  method: str(120).default(""),
  description: req("Design description", 5000),
  neededBy: z
    .string()
    .optional()
    .transform((v) => (v ? v : ""))
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  instructions: str(5000).default(""),
  attachmentIds,
  website: z.string().max(0).optional(),
});
export type QuoteInput = z.input<typeof quoteSchema>;

export const orderSchema = z.object({
  customer: z.object({ name: req("Full name", 120), email, phone: phone.refine((v) => v.length > 0, "Phone is required"), company: str(160).default("") }),
  shipping: z
    .object({
      method: z.enum(["pickup", "delivery"]),
      address: str(200).default(""),
      city: str(100).default(""),
      state: str(50).default(""),
      zip: str(20).default(""),
    })
    .refine((s) => s.method === "pickup" || (s.address && s.city && s.state && s.zip), { message: "Complete the delivery address", path: ["address"] }),
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f0-9]{24}$/),
        quantity: z.coerce.number().int().min(1).max(10000),
        size: str(40).default(""),
        color: str(60).default(""),
        customization: str(1000).default(""),
        attachmentIds,
      })
    )
    .min(1, "Your cart is empty")
    .max(50),
  notes: str(3000).default(""),
  website: z.string().max(0).optional(),
});
export type OrderInput = z.input<typeof orderSchema>;

export const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

/* ---------- admin resources ---------- */
export const serviceSchema = z.object({
  title: req("Title", 120),
  slug,
  icon: str(40).default("Sparkles"),
  shortDescription: str(300).default(""),
  description: str(8000).default(""),
  heroImage: imageUrl.default(""),
  benefits: strList(),
  suitableProducts: strList(),
  gallery: z.array(imageUrl).max(24).default([]),
  order: int,
  featured: bool,
  published: bool,
});

export const productSchema = z.object({
  name: req("Product name", 160),
  slug,
  shortDescription: str(300).default(""),
  description: str(8000).default(""),
  category: str(80).default(""),
  brand: str(80).default(""),
  images: z.array(imageUrl).max(12).default([]),
  sku: str(60).default(""),
  price: optNum,
  compareAtPrice: optNum,
  sizes: strList(30, 20),
  colors: strList(30, 40),
  material: str(200).default(""),
  customizationOptions: strList(20, 120),
  stock: optNum,
  availability: z.enum(["in_stock", "made_to_order", "out_of_stock"]).default("made_to_order"),
  featured: bool,
  published: bool,
  order: int,
});

export const categorySchema = z.object({
  name: req("Name", 80),
  slug,
  description: str(300).default(""),
  image: imageUrl.default(""),
  ctaType: z.enum(["products", "quote"]).default("quote"),
  order: int,
  published: bool,
});

export const brandSchema = z.object({
  name: req("Brand name", 80),
  slug,
  tagline: str(60).default("Collection"),
  description: str(2000).default(""),
  logo: imageUrl.default(""),
  banner: imageUrl.default(""),
  featured: bool,
  order: int,
  published: bool,
});

export const gallerySchema = z.object({
  image: imageUrl.refine((v) => v.length > 0, "Image is required"),
  caption: str(200).default(""),
  category: str(60).default("Custom Merchandise"),
  order: int,
  published: bool,
});

export const testimonialSchema = z.object({
  name: req("Customer name", 120),
  role: str(120).default(""),
  text: req("Review text", 2000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  image: imageUrl.default(""),
  order: int,
  published: bool,
});

export const faqSchema = z.object({
  question: req("Question", 300),
  answer: req("Answer", 3000),
  group: str(60).default("General"),
  order: int,
  published: bool,
});

export const teamSchema = z.object({
  name: req("Name", 120),
  role: str(120).default(""),
  bio: str(3000).default(""),
  photo: imageUrl.default(""),
  instagram: optUrl.default(""),
  facebook: optUrl.default(""),
  linkedin: optUrl.default(""),
  order: int,
  published: bool,
});

export const promotionSchema = z.object({
  title: req("Title", 120),
  badge: str(60).default(""),
  description: str(1000).default(""),
  eligibility: str(1000).default(""),
  icon: str(40).default("BadgePercent"),
  order: int,
  active: bool,
});

export const orderUpdateSchema = z.object({
  status: z.enum(["new", "awaiting_quote", "awaiting_approval", "confirmed", "in_production", "ready", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "not_required"]).optional(),
  internalNotes: str(5000).optional(),
});

export const quoteUpdateSchema = z.object({
  status: z.enum(["new", "reviewing", "quoted", "accepted", "rejected", "completed"]).optional(),
  quotedPrice: optNum,
  internalNotes: str(5000).optional(),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]).optional(),
  internalNotes: str(5000).optional(),
});

const navLink = z.object({ label: str(60), href: str(200) });
export const settingsSchema = z.object({
  companyName: req("Company name", 120),
  tagline: str(200),
  phone: str(40),
  email,
  location: str(200),
  logo: imageUrl,
  favicon: imageUrl,
  social: z.object({ facebook: optUrl, instagram: optUrl, tiktok: optUrl, threads: optUrl }),
  seo: z.object({ title: str(200), description: str(400), ogImage: imageUrl }),
  footer: z.object({ description: str(600), copyright: str(200) }),
  headerCta: navLink,
});

export const PAGE_KEYS = ["home", "about", "pricing", "privacy", "terms"] as const;
export const pageContentSchema = z.object({
  data: z
    .record(z.unknown())
    .refine((d) => JSON.stringify(d).length < 200_000, "Content is too large"),
  published: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(10, "Use at least 10 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
