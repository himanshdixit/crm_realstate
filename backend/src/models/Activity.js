import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  type: { type: String, required: true, trim: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  resourceType: { type: String, trim: true, default: null },
  resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  occurredAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, occurredAt: -1 });
schema.index({ organization: 1, deletedAt: 1, occurredAt: -1 });
export const Activity = mongoose.model("Activity", schema);
