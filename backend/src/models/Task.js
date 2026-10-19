import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const schema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["pending", "in-progress", "completed", "cancelled"], default: "pending", index: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  dueAt: { type: Date, required: true, index: true },
}, { timestamps: true, versionKey: false });
schema.plugin(auditFields);
schema.index({ organization: 1, assignee: 1, status: 1, dueAt: 1 });
schema.index({ organization: 1, deletedAt: 1, assignee: 1, status: 1, dueAt: 1 });
export const Task = mongoose.model("Task", schema);
