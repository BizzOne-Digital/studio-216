import { getAdmin } from "@/lib/auth";
import { handler, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const admin = await getAdmin();
  return ok({ authenticated: Boolean(admin), admin });
});
