import { type NextRequest } from "next/server";
import { handler, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { toPlain } from "@/lib/utils";
import { GalleryImage, Product } from "@/models/content";
import { StoredUpload } from "@/models/StoredUpload";
import { ContactInquiry, Order, QuoteRequest } from "@/models/submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  await connectDB();
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    quoteRequests,
    newQuotes,
    newInquiries,
    galleryImages,
    mediaFiles,
    orderStatus,
    quoteStatus,
    recentOrders,
    recentQuotes,
    recentInquiries,
    daily,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ published: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ["new", "awaiting_quote", "awaiting_approval"] } }),
    QuoteRequest.countDocuments(),
    QuoteRequest.countDocuments({ status: "new" }),
    ContactInquiry.countDocuments({ status: "new" }),
    GalleryImage.countDocuments(),
    StoredUpload.countDocuments(),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    QuoteRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).select("reference customer.name status subtotal requiresQuote createdAt").lean(),
    QuoteRequest.find().sort({ createdAt: -1 }).limit(6).select("reference name productType quantity status type createdAt").lean(),
    ContactInquiry.find().sort({ createdAt: -1 }).limit(6).select("name subject status createdAt").lean(),
    Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } }]),
      QuoteRequest.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } }]),
      ContactInquiry.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } }]),
    ]),
  ]);

  // Build a 30-day series from real submissions only.
  const [o, q, i] = daily.map((rows) => new Map((rows as { _id: string; c: number }[]).map((r) => [r._id, r.c])));
  const series = Array.from({ length: 30 }, (_, k) => {
    const d = new Date(Date.now() - (29 - k) * 86400000).toISOString().slice(0, 10);
    return { date: d.slice(5), orders: o.get(d) ?? 0, quotes: q.get(d) ?? 0, inquiries: i.get(d) ?? 0 };
  });

  return ok({
    stats: { totalProducts, activeProducts, totalOrders, pendingOrders, quoteRequests, newQuotes, newInquiries, galleryImages, mediaFiles },
    orderStatus: toPlain(orderStatus),
    quoteStatus: toPlain(quoteStatus),
    recentOrders: toPlain(recentOrders),
    recentQuotes: toPlain(recentQuotes),
    recentInquiries: toPlain(recentInquiries),
    series,
  });
});
