import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  email: { type: String, lowercase: true, trim: true, required: true, index: true },
  successful: { type: Boolean, required: true, index: true },
  failureReason: { type: String, default: null },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null, maxlength: 1000 },
  deviceFingerprint: { type: String, default: null },
  occurredAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false, versionKey: false });

loginHistorySchema.index({ user: 1, occurredAt: -1 });
loginHistorySchema.index({ email: 1, occurredAt: -1 });

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
