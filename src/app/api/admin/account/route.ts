import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError, handler, ok, parseJson, requireAdmin } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { changePasswordSchema } from "@/lib/validations";
import { AdminSession, AdminUser } from "@/models/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => ok(await requireAdmin(req)));

/** Change password. Signs out all other sessions. */
export const PUT = handler(async (req: NextRequest) => {
  const admin = await requireAdmin(req);
  const body = await parseJson(req, changePasswordSchema);
  await connectDB();
  const user = await AdminUser.findById(admin.id).select("+passwordHash");
  if (!user) throw new ApiError(404, "Account not found");
  if (!(await bcrypt.compare(body.currentPassword, user.passwordHash))) throw new ApiError(400, "Current password is incorrect");
  user.passwordHash = await hashPassword(body.newPassword);
  await user.save();
  await AdminSession.deleteMany({ user: user._id });
  return ok({ updated: true, reauthenticate: true });
});
