# Studio 216 Print and Design — Website & Admin

Next.js 15 (App Router) + TypeScript + Tailwind + MongoDB (Mongoose). Public website, shop/order-request flow, quote requests, and a full admin CMS. Built for Vercel.

## 1. Requirements
- Node.js 20+
- A MongoDB Atlas cluster (free tier works)

## 2. Environment variables
Copy `.env.example` to `.env.local` (local) and add the same values in Vercel → Project → Settings → Environment Variables.

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/studio216` |
| `SESSION_SECRET` | Yes | 32+ random characters (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `https://studio216printanddesign.com` (used for SEO, sitemap) |
| `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD` | Setup only | Used by `npm run create-admin`. Remove the password afterwards. |
| `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL` | Optional | Resend API key for new-submission emails. If unset, submissions are still saved and shown in admin. |

Never commit `.env` / `.env.local` (already in `.gitignore`).

## 3. MongoDB Atlas setup
1. Create a cluster → **Database Access**: add a database user with read/write.
2. **Network Access**: allow `0.0.0.0/0` (Vercel uses dynamic IPs) or use Atlas' Vercel integration.
3. Copy the connection string into `MONGODB_URI` and add a database name (e.g. `/studio216`).

## 4. Local setup
```bash
npm install
npm run seed          # loads business info, services, categories, FAQs, offers, page content (safe to re-run)
npm run create-admin  # creates the admin from ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD (min 12 chars)
npm run dev           # http://localhost:3000  — admin at /admin
```
Running `create-admin` again with the same email resets that password and signs out its sessions. There is no public admin sign-up.

## 5. Deploy to Vercel
1. Push the repo to GitHub and import it in Vercel (framework: Next.js, defaults are fine).
2. Add the environment variables above (Production and Preview).
3. Deploy. Then run `npm run seed` and `npm run create-admin` once from your machine pointed at the production `MONGODB_URI`.

## 6. How images work (survives redeploys)
- Admin uploads go to `POST /api/upload` and are stored in MongoDB (`StoredUpload`, binary excluded from list queries). Content stores only the URL, e.g. `/api/uploads/products/1731...-ab12....webp`.
- Served by `GET /api/uploads/[folder]/[filename]` with immutable caching and `nosniff`.
- **Vercel body limit (~4.5 MB):** files above 3 MB are sent automatically in sequential 3 MB chunks and assembled server-side, so the full 8 MB limit works on Vercel. Abandoned chunks expire after 1 hour.
- Replacing/removing an image only deletes the old file **after** the content save succeeds and only if no other content still references it. The Media Library blocks deleting images in use.
- **Customer artwork** (quotes, custom orders, cart items) is stored separately (`PrivateAttachment`), max 4 MB, PNG/JPEG/WebP/GIF/PDF, downloadable only by signed-in admins. It is never exposed by the public image route.
- Legacy `/uploads/...` URLs display a placeholder instead of breaking the layout.

## 7. Business rules built in
- No invented prices: products without a price show **Request Pricing** and are marked quote-required on orders.
- Prices are always recalculated on the server; no tax or shipping is invented.
- No online payment is taken. Orders are saved as pending with payment status `pending`; `src/app/api/orders/route.ts` is the place to add a payment gateway later.
- Offers are display-only and never auto-applied to totals.
- Testimonials, team members and gallery are empty until real content is added. Testimonials need approval (publish) before they appear, and empty sections hide automatically.
- Featured brands are seeded as neutral "Featured Brand 1/2" placeholders. Rename them and upload their logos in **Admin → Featured Brands**.
- Social icons only link once URLs are entered in **Admin → Website Settings**.

## 8. Security
- bcrypt password hashing, HttpOnly + SameSite=Lax + Secure (production) session cookie, 12-hour sessions stored in MongoDB (TTL).
- Every admin API checks the session; state-changing requests also require a same-origin `Origin` header (CSRF defense).
- MongoDB-backed rate limits on login and all public forms, plus honeypot fields.
- Zod validation on every API, with whitelisted fields (no mass assignment).

## 9. Before launch checklist
- [ ] Upload the real logo and favicon (Admin → Website Settings)
- [ ] Add social media URLs
- [ ] Rename featured brands, add logos/banners, and assign products
- [ ] Add products (prices optional)
- [ ] Replace placeholder (Unsplash) images with real shop photos
- [ ] Have the owner review the Privacy Policy and Terms (Admin → Pages Management)
- [ ] Optionally configure email notifications

## Scripts
`npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run seed` · `npm run create-admin`
