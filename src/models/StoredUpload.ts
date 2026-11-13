import mongoose, { Schema, type Model } from "mongoose";

export interface IStoredUpload {
  folder: string;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const StoredUploadSchema = new Schema<IStoredUpload>(
  {
    folder: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    // Binary is excluded by default so metadata queries never load image bytes.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

export const StoredUpload: Model<IStoredUpload> =
  (mongoose.models.StoredUpload as Model<IStoredUpload>) ||
  mongoose.model<IStoredUpload>("StoredUpload", StoredUploadSchema);
