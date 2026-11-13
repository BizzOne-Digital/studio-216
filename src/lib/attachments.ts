import "server-only";
import crypto from "crypto";
import { PrivateAttachment } from "@/models/PrivateAttachment";
import { ApiError } from "@/lib/api";

export const hashAttachmentToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

/**
 * Verifies that the submitter owns each attachment (via the one-time token returned at upload)
 * and marks it claimed so it can't be attached to another submission. Returns attachment ids.
 */
export async function claimAttachments(refs: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const ref of refs) {
    const [id, token] = ref.split(":");
    const res = await PrivateAttachment.updateOne(
      { _id: id, tokenHash: hashAttachmentToken(token), claimed: false },
      { $set: { claimed: true } }
    );
    if (res.modifiedCount !== 1) throw new ApiError(400, "One of your attachments has expired. Please re-upload it.");
    ids.push(id);
  }
  return ids;
}
