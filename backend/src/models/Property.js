import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  reference: { type: String, required: true, trim: true },
  status: { type: String, enum: ["draft", "available", "reserved", "sold", "rented", "archived"], default: "draft", index: true },
  priceMinor: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, trim: true, default: "INR" },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  description: { type: String, maxlength: 10000, default: "" },
  propertyType: { type: String, trim: true, default: "residential", index: true },
  bedrooms: { type: Number, min: 0, default: 0 },
  bathrooms: { type: Number, min: 0, default: 0 },
  areaSqFt: { type: Number, min: 0, default: 0 },
  address: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "", index: true },
  latitude: { type: Number, min: -90, max: 90, default: null },
  longitude: { type: Number, min: -180, max: 180, default: null },
  amenities: [{ type: String, trim: true }],
  featured: { type: Boolean, default: false, index: true },
  slug: { type: String, lowercase: true, trim: true, default: null },
  seoTitle: { type: String, maxlength: 180, default: "" },
  seoDescription: { type: String, maxlength: 320, default: "" },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, reference: 1 }, { unique: true });
schema.index({ organization: 1, status: 1, createdAt: -1 });
schema.index({ organization: 1, city: 1, propertyType: 1, priceMinor: 1 });
schema.index({ organization: 1, deletedAt: 1, status: 1, createdAt: -1 });
export const Property = mongoose.model("Property", schema);
