import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  type: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  readAt: { type: Date, default: null, index: true },
  link: { type: String, default: null, maxlength: 500 },
  dedupeKey: { type: String, default: null, maxlength: 300 },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ user: 1, readAt: 1, createdAt: -1 });
schema.index({ user: 1, deletedAt: 1, createdAt: -1 });
schema.index({ dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } });
export const Notification = mongoose.model("Notification", schema);
