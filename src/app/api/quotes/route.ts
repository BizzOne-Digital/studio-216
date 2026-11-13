import { type NextRequest } from "next/server";
import { ApiError, assertSameOrigin, clientIp, handler, ok, parseJson, rateLimit } from "@/lib/api";
import { claimAttachments } from "@/lib/attachments";
import { notifyAdmin } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { makeReference } from "@/lib/utils";
import { quoteSchema } from "@/lib/validations";
import { QuoteRequest } from "@/models/submissions";

export const runtime = "nodejs";

/** Handles both quote requests and custom order requests (type: "custom_order"). */
export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  const data = await parseJson(req, quoteSchema);
  await rateLimit(`quote:${clientIp(req)}`, 6, 60 * 10);
  await connectDB();
  const attachmentIds = await claimAttachments(data.attachmentIds);
  const reference = makeReference(data.type === "custom_order" ? "CO" : "QT");
  const { website: _hp, ...fields } = data;
  void _hp;
  const doc = await QuoteRequest.create({
    ...fields,
    neededBy: fields.neededBy ? new Date(fields.neededBy) : null,
    attachmentIds,
    reference,
  });
  if (!doc?._id) throw new ApiError(500, "Could not save your request");
  await notifyAdmin(`New ${data.type === "custom_order" ? "custom order" : "quote"} request ${reference}`, {
    Name: fields.name,
    Email: fields.email,
    Phone: fields.phone,
    Product: fields.productType,
    Quantity: fields.quantity,
    Attachments: attachmentIds.length,
  });
  return ok({ reference }, 201);
});
