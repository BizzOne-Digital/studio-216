/**
 * Initial content. Used to seed MongoDB (npm run seed) and as a safe fallback
 * when the database is not reachable (e.g. during a first build without env vars).
 * Everything here is editable from the admin dashboard once seeded.
 */
import type { AboutContent, HomeContent, LegalContent, PricingContent, SiteSettingsData } from "@/types";

export const img = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

/** Studio 216 brand imagery (public/images). Replaceable from the admin dashboard. */
const local = (name: string) => `/images/${name}.png`;
const P = {
  collection: local("custom_apparel_studio_collection"),
  embroideryStation: local("industrial_embroidery_studio_workstation"),
  embroideryHoodie: local("precision_embroidery_on_black_hoodie"),
  shopDisplay: local("premium_apparel_print_shop_display"),
  printStudio: local("premium_apparel_print_studio"),
  printingWorkshop: local("premium_apparel_printing_workshop"),
  customWorkshop: local("premium_custom_apparel_workshop"),
  purpleStudio: local("premium_purple_lit_apparel_studio"),
  logoShowcase: local("premium_silver_logo_printing_showcase"),
  dtgPrinting: local("vibrant_dtg_printing_studio"),
};

export const IMAGES = {
  hero: P.collection,
  heroMobile: P.shopDisplay,
  embroidery: P.embroideryHoodie,
  printing: P.dtgPrinting,
  promo: P.logoShowcase,
  about: P.embroideryStation,
  cta: P.customWorkshop,
  brand1: P.printingWorkshop,
  brand2: P.purpleStudio,
  tees: P.dtgPrinting,
  hoodies: P.embroideryHoodie,
  hats: P.collection,
  business: P.embroideryStation,
  drinkware: P.logoShowcase,
  stickers: P.logoShowcase,
  signage: P.purpleStudio,
  banners: P.printStudio,
  workwear: P.embroideryStation,
  folded: P.printingWorkshop,
  rack: P.printStudio,
};

export const DEFAULT_SETTINGS: SiteSettingsData = {
  companyName: "Studio 216 Print and Design",
  tagline: "Bringing your ideas to Reality",
  phone: "470-746-0951",
  email: "support@studio216printanddesign.com",
  location: "Metro Atlanta — Tucker / Decatur, GA",
  logo: "",
  favicon: "",
  social: { facebook: "", instagram: "", tiktok: "", threads: "" },
  seo: {
    title: "Studio 216 Print and Design | Custom Apparel, Embroidery & Printing — Metro Atlanta",
    description:
      "Custom apparel, embroidery, DTF printing, promotional products, decals, banners and signage for individuals and businesses in Tucker, Decatur and Metro Atlanta, GA.",
    ogImage: "",
  },
  footer: {
    description:
      "Custom apparel, embroidery, printing and promotional products for individuals, businesses, teams and organizations across Metro Atlanta.",
    copyright: "Studio 216 Print and Design. All rights reserved.",
  },
  headerCta: { label: "Request a Quote", href: "/request-quote" },
};

export const DEFAULT_HOME: HomeContent = {
  hero: {
    eyebrow: "Bringing Your Ideas to",
    headline: "Reality",
    description: "Custom apparel, embroidery, printing, promotional products and more — all in one place.",
    image: IMAGES.hero,
    mobileImage: IMAGES.heroMobile,
    primaryCta: { label: "Request a Quote", href: "/request-quote" },
    secondaryCta: { label: "Place an Order", href: "/shop" },
    features: [
      { icon: "Zap", label: "High-Quality Production" },
      { icon: "Truck", label: "Fast Turnaround" },
      { icon: "Award", label: "Custom Branding" },
      { icon: "Users", label: "Bulk & Business Orders" },
    ],
  },
  servicesPreview: {
    slugs: [],
    cards: [
      {
        title: "Custom Embroidery",
        description: "Personalized crewnecks, workwear, and branded apparel.",
        icon: "Scissors",
        image: IMAGES.embroidery,
        href: "/services/custom-embroidery",
      },
      {
        title: "Printing & Apparel",
        description: "Custom T-shirt printing and professional DTF transfers.",
        icon: "Shirt",
        image: IMAGES.printing,
        href: "/services/custom-t-shirt-printing",
      },
      {
        title: "Promotional Items & Decals",
        description: "Custom merchandise, UV DTF stickers, banners, tents, yard signs, and more.",
        icon: "Gift",
        image: IMAGES.promo,
        href: "/services/promotional-merchandise",
      },
    ],
  },
  featuredMerch: {
    title: "Featured Merch",
    description: "Browse our ready-to-order designs from our featured collections.",
  },
  about: {
    heading: "Your Brand. Your Vision. Our Craft.",
    body:
      "Studio 216 Print and Design is a custom apparel, branding, and promotional products business serving the Metro Atlanta area, including Tucker and Decatur, Georgia. We help individuals, businesses, teams, and organizations turn creative ideas into custom-made products.",
    image: IMAGES.about,
    highlights: ["Custom embroidery", "T-shirt & DTF printing", "Promotional products", "Banners, tents & signage"],
    cta: { label: "Learn About Us", href: "/about" },
  },
  categories: { heading: "What We Create", description: "From one-off pieces to full business rollouts — pick a category to get started." },
  process: {
    heading: "From Idea to Finished Product",
    note: "Production begins once your design proof is approved and order arrangements are confirmed.",
    steps: [
      { icon: "Lightbulb", title: "Share Your Idea", description: "Send us your concept, artwork, quantities and the products you have in mind." },
      { icon: "FileText", title: "Review Your Quote", description: "We review the details and send a clear quote based on product, quantity and method." },
      { icon: "PenTool", title: "Approve Your Design", description: "You receive a design proof. Nothing is produced until you approve it." },
      { icon: "PackageCheck", title: "Production & Fulfillment", description: "We produce, quality-check and arrange pickup or delivery for your order." },
    ],
  },
  offers: {
    heading: "Current Offers",
    description: "Ask about eligibility when you request your quote. Offers are confirmed on your quote and are not combined unless stated.",
    cta: { label: "Request Your Quote", href: "/request-quote" },
  },
  products: { heading: "Premade Merch", description: "Ready-to-order designs from our featured collections." },
  gallery: { heading: "Our Work Speaks for Itself", description: "A look at recent embroidery, printing and merchandise projects." },
  testimonials: { heading: "What Our Customers Say" },
  faq: { heading: "Frequently Asked Questions" },
  finalCta: {
    heading: "Ready to Bring Your Ideas to Reality?",
    description: "Let's create something that represents your brand.",
    image: IMAGES.cta,
    primary: { label: "Request a Quote", href: "/request-quote" },
    secondary: { label: "Contact Us", href: "/contact" },
  },
};

export const DEFAULT_ABOUT: AboutContent = {
  heroTitle: "About Studio 216",
  heroSubtitle: "Custom apparel, embroidery, printing and promotional products — made in Metro Atlanta.",
  heroImage: IMAGES.rack,
  story:
    "Studio 216 Print and Design is a custom apparel, branding, and promotional products business serving the Metro Atlanta area, including Tucker and Decatur, Georgia. We work with individuals, small businesses, teams, schools, churches and organizations to turn ideas into finished products they are proud to wear, hand out and display.",
  mission: "To make professional custom apparel and branded merchandise simple, reliable and accessible for every customer — from a single shirt to a full business rollout.",
  vision: "To be Metro Atlanta's go-to studio for custom apparel and branding, known for quality work, clear communication and dependable service.",
  whyChoose: [
    { title: "One studio, many services", description: "Embroidery, printing, DTF, promotional items, decals, banners and signage in one place." },
    { title: "Proof before production", description: "You approve your design before anything is produced." },
    { title: "Individual to bulk orders", description: "We handle personal pieces, team orders and business quantities." },
    { title: "Local and accessible", description: "Based in the Tucker / Decatur area and easy to reach by phone or email." },
  ],
  workshopImages: [IMAGES.folded, IMAGES.printing, IMAGES.embroidery],
};

export const DEFAULT_PRICING: PricingContent = {
  heading: "Custom Projects. Custom Pricing.",
  intro:
    "Every project is different, so we quote each one individually. Tell us what you need and we'll send a clear, itemized quote — no surprises.",
  factors: ["Product type", "Quantity", "Design complexity", "Print or embroidery method", "Customization requirements"],
};

export const DEFAULT_PRIVACY: LegalContent = {
  title: "Privacy Policy",
  updated: "",
  body: `Studio 216 Print and Design ("we", "us") respects your privacy. This policy explains what information we collect through this website and how we use it.

Information we collect
When you submit a quote request, custom order, order request or contact form, we collect the details you provide, such as your name, email address, phone number, project details, shipping or pickup information and any artwork files you upload.

How we use it
We use this information only to respond to your request, prepare quotes, produce and deliver orders, and communicate with you about your project. We do not sell your personal information.

Artwork and files
Artwork you upload is stored privately and is only accessible to authorized Studio 216 staff for the purpose of completing your project.

Contact
For questions about this policy, contact us using the details on our Contact page.

This policy should be reviewed by the business owner before publication and updated as needed.`,
};

export const DEFAULT_TERMS: LegalContent = {
  title: "Terms & Conditions",
  updated: "",
  body: `These terms apply to orders and quote requests placed with Studio 216 Print and Design.

Quotes
Quotes are based on the information provided and may change if quantities, products or design requirements change.

Design approval
Production begins only after you approve your design proof and order arrangements are confirmed. Please review proofs carefully for spelling, colors, sizes and placement.

Artwork
You confirm that you have the right to use any artwork, logos or trademarks you provide.

Orders and payment
Order requests submitted through this website are not paid orders. We will contact you to confirm pricing, payment and timelines before production.

Turnaround
Production times depend on the product, quantity and method, and are confirmed on your quote.

This page should be reviewed by the business owner before publication and updated as needed.`,
};

export const DEFAULT_SERVICES = [
  {
    title: "Custom Embroidery",
    slug: "custom-embroidery",
    icon: "Scissors",
    shortDescription: "Personalized crewnecks, workwear, and branded apparel.",
    description:
      "Embroidery gives your logo or design a premium, durable, textured finish. It is a strong choice for polos, hats, jackets, crewnecks and workwear that need to look professional and last.",
    heroImage: IMAGES.embroidery,
    benefits: ["Premium, textured finish", "Durable through repeated washing", "Ideal for logos and names", "Professional look for teams and staff"],
    suitableProducts: ["Polos", "Hats & caps", "Crewnecks & hoodies", "Jackets", "Workwear"],
  },
  {
    title: "Custom T-Shirt Printing",
    slug: "custom-t-shirt-printing",
    icon: "Shirt",
    shortDescription: "Custom printed tees for events, teams, brands and businesses.",
    description: "Full-color custom T-shirt printing for events, reunions, teams, businesses and clothing brands, from small runs to bulk orders.",
    heroImage: IMAGES.printing,
    benefits: ["Full-color designs", "Small runs and bulk orders", "Wide range of shirt styles and colors"],
    suitableProducts: ["T-shirts", "Long sleeves", "Tank tops", "Youth sizes"],
  },
  {
    title: "DTF Transfers",
    slug: "dtf-transfers",
    icon: "Layers",
    shortDescription: "Professional direct-to-film transfers with vivid color and detail.",
    description: "Direct-to-film (DTF) transfers reproduce detailed, full-color artwork on a wide range of fabrics. Available applied to garments or as ready-to-press transfers.",
    heroImage: IMAGES.folded,
    benefits: ["Vivid, detailed color", "Works on many fabric types", "Soft, flexible finish", "Available as ready-to-press transfers"],
    suitableProducts: ["T-shirts", "Hoodies", "Bags", "Hats"],
  },
  {
    title: "Promotional Merchandise",
    slug: "promotional-merchandise",
    icon: "Gift",
    shortDescription: "Branded tumblers, bottles, mugs and giveaways.",
    description: "Put your brand in your customers' hands with custom tumblers, water bottles, mugs, bags and event giveaways.",
    heroImage: IMAGES.promo,
    benefits: ["Keeps your brand visible", "Great for events and gifts", "Many product options"],
    suitableProducts: ["Tumblers", "Water bottles", "Mugs", "Tote bags", "Giveaways"],
  },
  {
    title: "UV DTF Stickers & Decals",
    slug: "uv-dtf-stickers-decals",
    icon: "Sticker",
    shortDescription: "Durable UV DTF stickers and custom decals.",
    description: "UV DTF stickers and custom decals for drinkware, packaging, windows, vehicles and products.",
    heroImage: IMAGES.stickers,
    benefits: ["Bold, durable finish", "Custom shapes and sizes", "Great for product branding"],
    suitableProducts: ["Cup wraps", "Logo stickers", "Window decals", "Vehicle decals"],
  },
  {
    title: "Custom Banners",
    slug: "custom-banners",
    icon: "Flag",
    shortDescription: "Event, storefront and promotional banners.",
    description: "Custom printed banners for grand openings, events, storefronts, trade shows and promotions.",
    heroImage: IMAGES.banners,
    benefits: ["High visibility", "Indoor and outdoor options", "Custom sizes"],
    suitableProducts: ["Vinyl banners", "Event banners", "Storefront banners"],
  },
  {
    title: "Event Tents",
    slug: "event-tents",
    icon: "Tent",
    shortDescription: "Branded canopy tents for events and vendors.",
    description: "Custom branded canopy tents that make your business stand out at festivals, markets, games and outdoor events.",
    heroImage: IMAGES.rack,
    benefits: ["Stand out at outdoor events", "Brand your vendor space"],
    suitableProducts: ["Canopy tents", "Tent walls", "Table covers"],
  },
  {
    title: "Yard Signs",
    slug: "yard-signs",
    icon: "Signpost",
    shortDescription: "Custom yard signs for businesses, events and celebrations.",
    description: "Custom yard signs for businesses, real estate, campaigns, graduations and celebrations.",
    heroImage: IMAGES.signage,
    benefits: ["Affordable local visibility", "Single or bulk quantities"],
    suitableProducts: ["Yard signs", "Directional signs", "Celebration signs"],
  },
  {
    title: "Business Branding Materials",
    slug: "business-branding",
    icon: "Briefcase",
    shortDescription: "Branded materials that make your business look established.",
    description: "Branding materials that help your business look consistent and professional, from apparel to printed and promotional items.",
    heroImage: IMAGES.business,
    benefits: ["Consistent brand presentation", "One studio for multiple items"],
    suitableProducts: ["Staff apparel", "Promotional items", "Decals", "Signage"],
  },
  {
    title: "Branded Workwear",
    slug: "branded-workwear",
    icon: "HardHat",
    shortDescription: "Embroidered and printed uniforms and workwear for your team.",
    description: "Branded workwear and uniforms for staff and crews — embroidered or printed with your logo.",
    heroImage: IMAGES.workwear,
    benefits: ["Professional team appearance", "Embroidery or print options", "Reorders made easy"],
    suitableProducts: ["Polos", "Work shirts", "Jackets", "Hats", "Hi-vis options"],
  },
];

export const DEFAULT_CATEGORIES = [
  { name: "Custom T-Shirts", slug: "custom-t-shirts", description: "Printed tees for events, teams and brands.", image: IMAGES.tees, ctaType: "products" },
  { name: "Hoodies & Crewnecks", slug: "hoodies-crewnecks", description: "Embroidered or printed fleece.", image: IMAGES.hoodies, ctaType: "products" },
  { name: "Embroidered Hats", slug: "embroidered-hats", description: "Caps and beanies with your logo.", image: IMAGES.hats, ctaType: "products" },
  { name: "Business Apparel", slug: "business-apparel", description: "Polos, button-ups and uniforms.", image: IMAGES.business, ctaType: "quote" },
  { name: "Promotional Drinkware", slug: "promotional-drinkware", description: "Tumblers, bottles and mugs.", image: IMAGES.drinkware, ctaType: "quote" },
  { name: "UV DTF Stickers", slug: "uv-dtf-stickers", description: "Durable full-color stickers.", image: IMAGES.stickers, ctaType: "quote" },
  { name: "Decals & Signage", slug: "decals-signage", description: "Window, vehicle and yard signs.", image: IMAGES.signage, ctaType: "quote" },
  { name: "Banners & Event Tents", slug: "banners-event-tents", description: "Make your event space stand out.", image: IMAGES.banners, ctaType: "quote" },
] as const;

export const DEFAULT_BRANDS = [
  { name: "Featured Brand 1", slug: "featured-brand-1", tagline: "Collection", description: "Add this brand's name, logo and description in the admin dashboard.", banner: IMAGES.brand1, featured: true, order: 1 },
  { name: "Featured Brand 2", slug: "featured-brand-2", tagline: "Collection", description: "Add this brand's name, logo and description in the admin dashboard.", banner: IMAGES.brand2, featured: true, order: 2 },
];

export const DEFAULT_PROMOTIONS = [
  { title: "10% Off Your First Order", badge: "New Customers", icon: "BadgePercent", description: "First-time customers can ask about 10% off their first order.", eligibility: "First order only. Confirmed on your quote." },
  { title: "Bulk Order Discounts", badge: "Teams & Businesses", icon: "Boxes", description: "Larger quantities may qualify for reduced per-item pricing.", eligibility: "Based on quantity and product. Confirmed on your quote." },
  { title: "Referral Discounts", badge: "Spread the Word", icon: "UserPlus", description: "Refer a friend or business and ask about our referral discount.", eligibility: "Referral must place an order. Details confirmed on request." },
];

export const DEFAULT_FAQS = [
  { question: "How do I request a custom quote?", answer: "Use the Request a Quote page and share your product, quantity, colors, sizes and any artwork. We'll review it and reply with a quote." },
  { question: "Do you accept bulk orders?", answer: "Yes. We handle orders for teams, businesses, events and organizations. Larger quantities may qualify for bulk pricing." },
  { question: "Can I provide my own design?", answer: "Yes. You can upload your artwork with your quote request. If you need help, we can also work with you on a design." },
  { question: "Do you offer embroidery and DTF printing?", answer: "Yes. We offer custom embroidery as well as DTF transfers and custom T-shirt printing." },
  { question: "Can businesses order branded workwear?", answer: "Yes. We produce embroidered and printed workwear, polos, hats and jackets for staff and crews." },
  { question: "How long does production take?", answer: "It depends on the product, quantity and method. Your estimated timeline is confirmed on your quote after your design is approved." },
  { question: "What information is needed for a custom order?", answer: "Product type, quantity, sizes, colors, print or embroidery preference, your artwork or design idea, and your needed-by date if you have one." },
];
