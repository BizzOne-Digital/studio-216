import { type NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { handler, ok } from "@/lib/api";
import { getProducts } from "@/lib/data";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { toPlain } from "@/lib/utils";
import { Product } from "@/models/content";

export const runtime = "nodejs";

/** Public catalog: published products only. ?ids=a,b returns current data for cart validation. */
export const GET = handler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const ids = url.searchParams.get("ids");
  if (ids) {
    const list = ids.split(",").filter(isValidObjectId).slice(0, 50);
    if (!isDbConfigured() || !list.length) return ok([]);
    await connectDB();
    const items = await Product.find({ _id: { $in: list }, published: true })
      .select("name slug images price sizes colors availability")
      .lean();
    return ok(toPlain(items));
  }
  const items = await getProducts({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    brand: url.searchParams.get("brand") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
    color: url.searchParams.get("color") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    featured: url.searchParams.get("featured") === "true",
    limit: Number(url.searchParams.get("limit")) || 60,
  });
  return ok(items);
});
