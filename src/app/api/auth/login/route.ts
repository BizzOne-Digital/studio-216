import { type NextRequest } from "next/server";
import { ApiError, assertSameOrigin, clientIp, handler, ok, parseJson, rateLimit } from "@/lib/api";
import { createSession, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { AdminUser } from "@/models/auth";

export const runtime = "nodejs";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  const { email, password } = await parseJson(req, loginSchema);
  await rateLimit(`login:${clientIp(req)}`, 8, 15 * 60);
  await rateLimit(`login-email:${email}`, 8, 15 * 60);
  const user = await verifyCredentials(email, password);
  if (!user) throw new ApiError(401, "Incorrect email or password");
  await createSession(String(user._id), req.headers.get("user-agent") ?? undefined);
  await AdminUser.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  return ok({ email: user.email, name: user.name });
});
