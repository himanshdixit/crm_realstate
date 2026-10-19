import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const PasswordResetToken = mongoose.model("PasswordResetToken", schema);
