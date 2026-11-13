import { handler, ok } from "@/lib/api";
import { getServices } from "@/lib/data";

export const runtime = "nodejs";

export const GET = handler(async () => ok(await getServices()));
