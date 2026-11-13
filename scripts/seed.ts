/**
 * Seeds initial Studio 216 content. Safe to re-run: existing documents are never overwritten
 * ($setOnInsert only), so admin edits are preserved.
 *
 *   npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import mongoose from "mongoose";
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
} from "../src/config/defaults";
import { Brand, FAQ, PageContent, ProductCategory, Promotion, Service, SiteSettings } from "../src/models/content";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local or .env first.");
  await mongoose.connect(uri);
  console.log("Connected. Seeding…");

  await SiteSettings.updateOne({ key: "main" }, { $setOnInsert: { key: "main", data: DEFAULT_SETTINGS } }, { upsert: true });
  const pages = { home: DEFAULT_HOME, about: DEFAULT_ABOUT, pricing: DEFAULT_PRICING, privacy: DEFAULT_PRIVACY, terms: DEFAULT_TERMS };
  for (const [page, data] of Object.entries(pages)) {
    await PageContent.updateOne({ page }, { $setOnInsert: { page, data, published: true } }, { upsert: true });
  }

  const upsertBySlug = async <T extends { slug: string }>(model: mongoose.Model<never>, items: readonly T[], extra: (i: number) => object = () => ({})) => {
    for (const [i, item] of items.entries()) {
      await model.updateOne({ slug: item.slug } as never, { $setOnInsert: { ...item, order: i + 1, published: true, ...extra(i) } } as never, { upsert: true });
    }
  };
  await upsertBySlug(Service as never, DEFAULT_SERVICES, (i) => ({ featured: i < 3 }));
  await upsertBySlug(ProductCategory as never, DEFAULT_CATEGORIES);
  await upsertBySlug(Brand as never, DEFAULT_BRANDS);

  for (const [i, p] of DEFAULT_PROMOTIONS.entries()) {
    await Promotion.updateOne({ title: p.title }, { $setOnInsert: { ...p, order: i + 1, active: true } }, { upsert: true });
  }
  for (const [i, f] of DEFAULT_FAQS.entries()) {
    await FAQ.updateOne({ question: f.question }, { $setOnInsert: { ...f, group: "General", order: i + 1, published: true } }, { upsert: true });
  }

  // Ensure indexes (unique slugs, TTLs, upload compound index) exist.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes().catch(() => undefined)));

  console.log("Done. Products, testimonials, team members and gallery images are intentionally left empty — add real ones in the admin dashboard.");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
