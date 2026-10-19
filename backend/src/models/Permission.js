import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true, immutable: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  resource: { type: String, required: true, lowercase: true, trim: true, index: true },
  action: { type: String, required: true, lowercase: true, trim: true },
  isSystem: { type: Boolean, default: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true, versionKey: false });

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model("Permission", permissionSchema);
