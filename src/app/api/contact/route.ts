import { type NextRequest } from "next/server";
import { ApiError, assertSameOrigin, clientIp, handler, ok, parseJson, rateLimit } from "@/lib/api";
import { notifyAdmin } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { contactSchema } from "@/lib/validations";
import { ContactInquiry } from "@/models/submissions";

export const runtime = "nodejs";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  const data = await parseJson(req, contactSchema);
  await rateLimit(`contact:${clientIp(req)}`, 5, 60 * 10);
  await connectDB();
  const { website: _hp, ...fields } = data;
  void _hp;
  const doc = await ContactInquiry.create(fields);
  if (!doc?._id) throw new ApiError(500, "Could not save your message");
  await notifyAdmin(`New website inquiry: ${fields.subject || fields.name}`, fields);
  return ok({ id: String(doc._id) }, 201);
});
