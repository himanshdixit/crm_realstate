import mongoose from "mongoose";
import { auditFields } from "./plugins/auditFields.js";

const { ObjectId } = mongoose.Schema.Types;
const baseOptions = { timestamps: true, versionKey: false };

function createModel(name, collection, definition, indexes = []) {
  const schema = new mongoose.Schema({
    organization: { type: ObjectId, ref: "Organization", default: null, index: true },
    ...definition,
  }, { ...baseOptions, collection });
  schema.plugin(auditFields);
  indexes.forEach(([fields, options]) => schema.index(fields, options));
  return mongoose.model(name, schema);
}

export const PropertyMedia = createModel("PropertyMedia", "propertymedia", {
  property: { type: ObjectId, ref: "Property", required: true, index: true },
  kind: { type: String, enum: ["image", "floor-plan", "video"], default: "image", index: true },
  title: { type: String, trim: true, maxlength: 160, default: "" },
  url: { type: String, required: true, trim: true, maxlength: 2000 },
  publicId: { type: String, required: true, trim: true, maxlength: 500 },
  alt: { type: String, trim: true, maxlength: 300, default: "" },
  order: { type: Number, min: 0, default: 0 },
  featured: { type: Boolean, default: false },
}, [[{ organization: 1, property: 1, order: 1 }]]);

export const Favorite = createModel("Favorite", "favorites", {
  user: { type: ObjectId, ref: "User", required: true, index: true },
  property: { type: ObjectId, ref: "Property", required: true, index: true },
}, [[{ organization: 1, user: 1, property: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } }]]);

export const Note = createModel("Note", "notes", {
  ownerType: { type: String, enum: ["Lead", "Customer", "Property", "Booking", "Project"], required: true, index: true },
  ownerId: { type: ObjectId, required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 10000 },
  pinned: { type: Boolean, default: false },
}, [[{ organization: 1, ownerType: 1, ownerId: 1, createdAt: -1 }]]);

export const Enquiry = createModel("Enquiry", "enquiries", {
  name: { type: String, required: true, trim: true, maxlength: 160 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  property: { type: ObjectId, ref: "Property", default: null },
  source: { type: String, trim: true, maxlength: 100, default: "website" },
  message: { type: String, trim: true, maxlength: 5000, default: "" },
  status: { type: String, enum: ["new", "contacted", "qualified", "closed"], default: "new", index: true },
  assignedTo: { type: ObjectId, ref: "User", default: null },
}, [[{ organization: 1, status: 1, createdAt: -1 }]]);

export const Testimonial = createModel("Testimonial", "testimonials", {
  customerName: { type: String, required: true, trim: true, maxlength: 160 },
  designation: { type: String, trim: true, maxlength: 160, default: "" },
  content: { type: String, required: true, trim: true, maxlength: 3000 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
}, [[{ organization: 1, status: 1, createdAt: -1 }]]);

export const Faq = createModel("Faq", "faqs", {
  question: { type: String, required: true, trim: true, maxlength: 500 },
  answer: { type: String, required: true, trim: true, maxlength: 10000 },
  category: { type: String, trim: true, maxlength: 100, default: "general" },
  order: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
}, [[{ organization: 1, category: 1, order: 1 }]]);

export const CommunicationTemplate = createModel("CommunicationTemplate", "communicationtemplates", {
  name: { type: String, required: true, trim: true, maxlength: 160 },
  channel: { type: String, enum: ["email", "sms", "whatsapp"], required: true, index: true },
  subject: { type: String, trim: true, maxlength: 300, default: "" },
  content: { type: String, required: true, maxlength: 50000 },
  variables: [{ type: String, trim: true }],
  status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
}, [[{ organization: 1, channel: 1, name: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } }]]);

export const Chat = createModel("Chat", "chats", {
  title: { type: String, trim: true, maxlength: 200, default: "" },
  participants: [{ type: ObjectId, ref: "User", required: true }],
  lastMessageAt: { type: Date, default: null, index: true },
}, [[{ organization: 1, participants: 1, lastMessageAt: -1 }]]);

export const Message = createModel("Message", "messages", {
  chat: { type: ObjectId, ref: "Chat", required: true, index: true },
  sender: { type: ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 10000 },
  attachmentUrl: { type: String, trim: true, maxlength: 2000, default: "" },
  readBy: [{ user: { type: ObjectId, ref: "User" }, readAt: { type: Date, default: Date.now } }],
}, [[{ organization: 1, chat: 1, createdAt: -1 }]]);
