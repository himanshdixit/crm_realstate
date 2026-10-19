import mongoose from "mongoose";
import validator from "validator";
import { auditFields } from "./plugins/auditFields.js";

const deviceSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true },
  name: { type: String, trim: true, default: "Unknown device" },
  lastSeenAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: { validator: validator.isEmail, message: "A valid email address is required" },
  },
  phone: { type: String, trim: true, default: null },
  passwordHash: { type: String, required: true, select: false },
  avatar: {
    publicId: { type: String, default: null },
    url: { type: String, default: null },
  },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  directPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  deniedPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null, index: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  status: { type: String, enum: ["pending", "active", "suspended", "locked", "disabled"], default: "pending", index: true },
  emailVerifiedAt: { type: Date, default: null },
  phoneVerifiedAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
  failedLoginAttempts: { type: Number, min: 0, default: 0, select: false },
  lockedUntil: { type: Date, default: null, select: false },
  lastLoginAt: { type: Date, default: null },
  lastSeenAt: { type: Date, default: null },
  locale: { type: String, default: "en" },
  timezone: { type: String, default: "UTC" },
  devices: { type: [deviceSchema], default: [] },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(_document, object) {
      delete object.passwordHash;
      delete object.failedLoginAttempts;
      delete object.lockedUntil;
      return object;
    },
  },
});

userSchema.plugin(auditFields);
userSchema.index(
  { organization: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } },
);
userSchema.index({ organization: 1, status: 1, createdAt: -1 });
userSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

export const User = mongoose.model("User", userSchema);
