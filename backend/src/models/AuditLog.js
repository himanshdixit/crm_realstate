import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  action: { type: String, required: true, lowercase: true, trim: true, index: true },
  resourceType: { type: String, required: true, trim: true, index: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  requestId: { type: String, default: null, index: true },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null, maxlength: 1000 },
  occurredAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false, versionKey: false, strict: true });

auditLogSchema.index({ organization: 1, resourceType: 1, resourceId: 1, occurredAt: -1 });
auditLogSchema.index({ organization: 1, actor: 1, occurredAt: -1 });

for (const method of ["updateOne", "updateMany", "findOneAndUpdate", "deleteOne", "deleteMany", "findOneAndDelete"]) {
  auditLogSchema.pre(method, function preventMutation() {
    throw new Error("Audit logs are append-only");
  });
}

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
