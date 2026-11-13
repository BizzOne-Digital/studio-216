import mongoose, { Schema, type Model } from "mongoose";

/* ---------- Order ---------- */
export const ORDER_STATUSES = [
  "new",
  "awaiting_quote",
  "awaiting_approval",
  "confirmed",
  "in_production",
  "ready",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IOrderItem {
  product: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  customization: string;
  attachmentIds: string[];
}
export interface IOrder {
  reference: string;
  customer: { name: string; email: string; phone: string; company?: string };
  shipping: { method: "pickup" | "delivery"; address?: string; city?: string; state?: string; zip?: string };
  items: IOrderItem[];
  subtotal: number;
  requiresQuote: boolean;
  notes: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "not_required";
  internalNotes: string;
  statusHistory: { status: string; at: Date }[];
}
const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: String,
    name: String,
    slug: String,
    image: String,
    size: String,
    color: String,
    quantity: { type: Number, min: 1 },
    unitPrice: { type: Number, default: null },
    lineTotal: { type: Number, default: null },
    customization: { type: String, default: "" },
    attachmentIds: { type: [String], default: [] },
  },
  { _id: false }
);
const OrderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      company: String,
    },
    shipping: {
      method: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
      address: String,
      city: String,
      state: String,
      zip: String,
    },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    requiresQuote: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    status: { type: String, enum: ORDER_STATUSES, default: "new", index: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "not_required"], default: "pending" },
    internalNotes: { type: String, default: "" },
    statusHistory: { type: [{ status: String, at: Date }], default: [] },
  },
  { timestamps: true }
);
export const Order: Model<IOrder> = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);

/* ---------- QuoteRequest (also used for custom orders) ---------- */
export const QUOTE_STATUSES = ["new", "reviewing", "quoted", "accepted", "rejected", "completed"] as const;
export interface IQuoteRequest {
  reference: string;
  type: "quote" | "custom_order";
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  productType: string;
  quantity: number;
  colors: string;
  sizes: string;
  method: string;
  description: string;
  neededBy?: Date | null;
  instructions: string;
  attachmentIds: string[];
  status: (typeof QUOTE_STATUSES)[number];
  quotedPrice?: number | null;
  internalNotes: string;
}
const QuoteRequestSchema = new Schema<IQuoteRequest>(
  {
    reference: { type: String, required: true, unique: true },
    type: { type: String, enum: ["quote", "custom_order"], default: "quote" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    service: { type: String, default: "" },
    productType: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    colors: { type: String, default: "" },
    sizes: { type: String, default: "" },
    method: { type: String, default: "" },
    description: { type: String, default: "" },
    neededBy: { type: Date, default: null },
    instructions: { type: String, default: "" },
    attachmentIds: { type: [String], default: [] },
    status: { type: String, enum: QUOTE_STATUSES, default: "new", index: true },
    quotedPrice: { type: Number, default: null },
    internalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);
export const QuoteRequest: Model<IQuoteRequest> =
  (mongoose.models.QuoteRequest as Model<IQuoteRequest>) || mongoose.model<IQuoteRequest>("QuoteRequest", QuoteRequestSchema);

/* ---------- ContactInquiry ---------- */
export const INQUIRY_STATUSES = ["new", "in_progress", "resolved"] as const;
export interface IContactInquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: (typeof INQUIRY_STATUSES)[number];
  internalNotes: string;
}
const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: "new", index: true },
    internalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);
export const ContactInquiry: Model<IContactInquiry> =
  (mongoose.models.ContactInquiry as Model<IContactInquiry>) ||
  mongoose.model<IContactInquiry>("ContactInquiry", ContactInquirySchema);
