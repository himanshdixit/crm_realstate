import { Appointment } from "../models/Appointment.js";
import { Booking } from "../models/Booking.js";
import { Builder } from "../models/Builder.js";
import { Customer } from "../models/Customer.js";
import { Document } from "../models/Document.js";
import { Invoice } from "../models/Invoice.js";
import { Lead } from "../models/Lead.js";
import { MarketingCampaign } from "../models/MarketingCampaign.js";
import { Payment } from "../models/Payment.js";
import { Project } from "../models/Project.js";
import { Property } from "../models/Property.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { Task } from "../models/Task.js";
import { Visit } from "../models/Visit.js";
import { Blog, KnowledgeBaseArticle } from "../models/ContentModels.js";
import { Activity } from "../models/Activity.js";
import { Notification } from "../models/Notification.js";
import { Chat, CommunicationTemplate, Enquiry, Faq, Favorite, Message, Note, PropertyMedia, Testimonial } from "../models/ExtendedCrmModels.js";

const config = (model, permission, fields, searchFields, populate = []) => ({ model, permission, fields, searchFields, populate, sortFields: ["createdAt", "updatedAt", "status", "name", "title", "dueAt", "scheduledAt"] });
export const resourceRegistry = Object.freeze({
  properties: config(Property, "properties", ["title", "reference", "status", "priceMinor", "currency", "assignedAgent", "description", "propertyType", "bedrooms", "bathrooms", "areaSqFt", "address", "city", "latitude", "longitude", "amenities", "featured", "slug", "seoTitle", "seoDescription"], ["title", "reference", "city", "address"]),
  leads: config(Lead, "leads", ["name", "email", "phone", "status", "source", "score", "assignedTo", "convertedAt"], ["name", "email", "phone"], ["assignedTo"]),
  customers: config(Customer, "customers", ["firstName", "lastName", "email", "phone", "status", "assignedAgent", "sourceLead", "notes"], ["firstName", "lastName", "email", "phone"], ["assignedAgent"]),
  projects: config(Project, "projects", ["name", "builder", "status", "city", "area", "description", "completionDate"], ["name", "city", "area"], ["builder"]),
  builders: config(Builder, "builders", ["name", "email", "phone", "website", "status", "description"], ["name", "email", "phone"]),
  visits: config(Visit, "visits", ["customer", "property", "agent", "scheduledAt", "status", "feedback"], ["feedback"], ["customer", "property", "agent"]),
  bookings: config(Booking, "bookings", ["property", "customer", "agent", "status", "totalMinor", "currency", "bookedAt"], [], ["property", "customer", "agent"]),
  tasks: config(Task, "tasks", ["title", "assignee", "status", "priority", "dueAt"], ["title"], ["assignee"]),
  appointments: config(Appointment, "appointments", ["title", "owner", "attendeeName", "status", "startsAt", "endsAt"], ["title", "attendeeName"], ["owner"]),
  invoices: config(Invoice, "invoices", ["number", "customer", "booking", "status", "currency", "lines", "totalMinor", "dueAt"], ["number"], ["customer", "booking"]),
  payments: config(Payment, "payments", ["booking", "reference", "amountMinor", "currency", "status", "paidAt"], ["reference"], ["booking"]),
  documents: config(Document, "documents", ["name", "category", "url", "publicId", "mimeType", "size", "ownerType", "ownerId", "visibility"], ["name", "category"]),
  "support-tickets": config(SupportTicket, "support", ["subject", "description", "status", "priority", "requester", "assignee"], ["subject", "description"], ["requester", "assignee"]),
  blogs: config(Blog, "content", ["title", "slug", "summary", "content", "status", "publishedAt"], ["title", "slug", "summary"]),
  "knowledge-base": config(KnowledgeBaseArticle, "content", ["title", "slug", "summary", "content", "status", "publishedAt"], ["title", "slug", "summary"]),
  campaigns: config(MarketingCampaign, "marketing", ["name", "channel", "status", "subject", "content", "scheduledAt", "audienceSize"], ["name", "subject"]),
  "property-media": config(PropertyMedia, "properties", ["property", "kind", "title", "url", "publicId", "alt", "order", "featured"], ["title", "alt"], ["property"]),
  favorites: config(Favorite, "properties", ["user", "property"], [], ["user", "property"]),
  notes: config(Note, "customers", ["ownerType", "ownerId", "content", "pinned"], ["content"]),
  enquiries: config(Enquiry, "enquiries", ["name", "email", "phone", "property", "source", "message", "status", "assignedTo"], ["name", "email", "phone", "message"], ["property", "assignedTo"]),
  testimonials: config(Testimonial, "content", ["customerName", "designation", "content", "rating", "status"], ["customerName", "content"]),
  faqs: config(Faq, "content", ["question", "answer", "category", "order", "status"], ["question", "answer", "category"]),
  "communication-templates": config(CommunicationTemplate, "marketing", ["name", "channel", "subject", "content", "variables", "status"], ["name", "subject", "content"]),
  chats: config(Chat, "notifications", ["title", "participants", "lastMessageAt"], ["title"], ["participants"]),
  messages: config(Message, "notifications", ["chat", "sender", "content", "attachmentUrl", "readBy"], ["content"], ["chat", "sender"]),
  notifications: config(Notification, "notifications", ["user", "type", "title", "message", "readAt", "link"], ["title", "message"], ["user"]),
  activities: config(Activity, "audit", ["actor", "type", "title", "description", "resourceType", "resourceId", "occurredAt"], ["title", "description", "type"], ["actor"]),
});
