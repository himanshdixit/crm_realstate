import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  reference: { type: String, required: true, trim: true },
  amountMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, uppercase: true, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending", index: true },
  paidAt: { type: Date, default: null, index: true },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, reference: 1 }, { unique: true });
schema.index({ organization: 1, status: 1, paidAt: -1 });
schema.index({ organization: 1, deletedAt: 1, status: 1, paidAt: -1 });
export const Payment = mongoose.model("Payment", schema);
