import { handler, ok } from "@/lib/api";
import { getBrands } from "@/lib/data";

export const runtime = "nodejs";

export const GET = handler(async () => ok(await getBrands()));
