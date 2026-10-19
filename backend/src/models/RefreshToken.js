import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  tokenId: { type: String, required: true, unique: true },
  familyId: { type: String, required: true, index: true },
  replacedByTokenId: { type: String, default: null },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null, index: true },
  revokeReason: { type: String, default: null, maxlength: 200 },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null, maxlength: 1000 },
  deviceFingerprint: { type: String, default: null, index: true },
  lastUsedAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, revokedAt: 1, expiresAt: 1 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
