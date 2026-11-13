import { type NextRequest } from "next/server";
import { assertSameOrigin, handler, ok } from "@/lib/api";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await destroySession();
  return ok({ loggedOut: true });
});
