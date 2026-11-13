import { type NextRequest } from "next/server";
import { ApiError, assertSameOrigin, clientIp, handler, ok, parseJson, rateLimit } from "@/lib/api";
import { claimAttachments } from "@/lib/attachments";
import { notifyAdmin } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { makeReference } from "@/lib/utils";
import { orderSchema } from "@/lib/validations";
import { Product } from "@/models/content";
import { Order, type IOrderItem } from "@/models/submissions";

export const runtime = "nodejs";

/**
 * Creates an order REQUEST. No payment is taken: prices are recalculated from product records,
 * items without a price are marked quote-required, and payment status stays "pending".
 */
export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  const data = await parseJson(req, orderSchema);
  await rateLimit(`order:${clientIp(req)}`, 6, 60 * 10);
  await connectDB();

  const ids = [...new Set(data.items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: ids }, published: true }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: IOrderItem[] = [];
  for (const it of data.items) {
    const p = byId.get(it.productId);
    if (!p) throw new ApiError(400, "One of the products in your cart is no longer available. Please review your cart.");
    if (p.availability === "out_of_stock") throw new ApiError(400, `${p.name} is currently out of stock.`);
    if (it.size && p.sizes.length && !p.sizes.includes(it.size)) throw new ApiError(400, `Invalid size for ${p.name}`);
    if (it.color && p.colors.length && !p.colors.includes(it.color)) throw new ApiError(400, `Invalid color for ${p.name}`);
    const unit = typeof p.price === "number" ? p.price : null;
    items.push({
      product: String(p._id),
      name: p.name,
      slug: p.slug,
      image: p.images[0] ?? "",
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      unitPrice: unit,
      lineTotal: unit === null ? null : Math.round(unit * it.quantity * 100) / 100,
      customization: it.customization,
      attachmentIds: await claimAttachments(it.attachmentIds),
    });
  }
  const requiresQuote = items.some((i) => i.unitPrice === null);
  const subtotal = Math.round(items.reduce((s, i) => s + (i.lineTotal ?? 0), 0) * 100) / 100;
  const reference = makeReference("S216");

  const order = await Order.create({
    reference,
    customer: data.customer,
    shipping: data.shipping,
    items,
    subtotal,
    requiresQuote,
    notes: data.notes,
    status: requiresQuote ? "awaiting_quote" : "new",
    paymentStatus: "pending",
    statusHistory: [{ status: requiresQuote ? "awaiting_quote" : "new", at: new Date() }],
  });
  if (!order?._id) throw new ApiError(500, "Could not save your order");

  await notifyAdmin(`New order request ${reference}`, {
    Customer: data.customer.name,
    Email: data.customer.email,
    Phone: data.customer.phone,
    Items: items.length,
    Subtotal: requiresQuote ? `${subtotal} (+ items needing a quote)` : subtotal,
    Fulfillment: data.shipping.method,
  });
  return ok({ reference, subtotal, requiresQuote }, 201);
});
