import mongoose, { Schema, type Model } from "mongoose";

/** Temporary chunk storage so admin uploads up to 8 MB fit under serverless request-body limits (~4.5 MB on Vercel). */
export interface IUploadChunk {
  uploadId: string;
  index: number;
  data: Buffer;
  createdAt: Date;
}

const UploadChunkSchema = new Schema<IUploadChunk>({
  uploadId: { type: String, required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
  // Abandoned chunks expire automatically after one hour.
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});
UploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });

export const UploadChunk: Model<IUploadChunk> =
  (mongoose.models.UploadChunk as Model<IUploadChunk>) || mongoose.model<IUploadChunk>("UploadChunk", UploadChunkSchema);
