import mongoose from "mongoose";
import "./Permission.js";
import { auditFields } from "./plugins/auditFields.js";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  isSystem: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, versionKey: false });

roleSchema.plugin(auditFields);
roleSchema.index({ organization: 1, slug: 1 }, { unique: true });

export const Role = mongoose.model("Role", roleSchema);
