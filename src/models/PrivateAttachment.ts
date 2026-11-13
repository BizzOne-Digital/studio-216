import mongoose, { Schema, type Model } from "mongoose";

/** Customer artwork. Never served by the public image route; admin-only download. */
export interface IPrivateAttachment {
  originalName: string;
  mimeType: string;
  size: number;
  data: Buffer;
  tokenHash: string;
  claimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const S = new Schema<IPrivateAttachment>(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
    tokenHash: { type: String, required: true, select: false },
    claimed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const PrivateAttachment: Model<IPrivateAttachment> =
  (mongoose.models.PrivateAttachment as Model<IPrivateAttachment>) ||
  mongoose.model<IPrivateAttachment>("PrivateAttachment", S);
