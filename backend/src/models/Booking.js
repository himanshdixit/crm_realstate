import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", index: true },
  totalMinor: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, default: "INR" },
  bookedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, status: 1, bookedAt: -1 });
schema.index({ organization: 1, deletedAt: 1, status: 1, bookedAt: -1 });
export const Booking = mongoose.model("Booking", schema);
