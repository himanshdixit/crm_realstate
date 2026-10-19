import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  attendeeName: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["scheduled", "completed", "cancelled", "no-show"], default: "scheduled", index: true },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, owner: 1, status: 1, startsAt: 1 });
schema.index({ organization: 1, deletedAt: 1, owner: 1, status: 1, startsAt: 1 });
export const Appointment = mongoose.model("Appointment", schema);
