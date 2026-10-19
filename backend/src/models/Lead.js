import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  email: { type: String, lowercase: true, trim: true, default: null },
  phone: { type: String, trim: true, default: null },
  status: { type: String, enum: ["new", "contacted", "qualified", "proposal", "negotiation", "converted", "lost"], default: "new", index: true },
  source: { type: String, trim: true, lowercase: true, default: "other", index: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  convertedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, status: 1, createdAt: -1 });
schema.index({ organization: 1, source: 1, createdAt: -1 });
schema.index({ organization: 1, deletedAt: 1, status: 1, createdAt: -1 });
schema.index({ organization: 1, deletedAt: 1, assignedTo: 1, status: 1 });
export const Lead = mongoose.model("Lead", schema);
