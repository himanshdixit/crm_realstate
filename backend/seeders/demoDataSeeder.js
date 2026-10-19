import { resourceRegistry } from "../src/config/resourceRegistry.js";
import { Role } from "../src/models/Role.js";
import { User } from "../src/models/User.js";

const marker = "EstateFlow Demo";
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

function audit(owner) {
  return { organization: owner.organization || null, createdBy: owner._id, updatedBy: owner._id, deletedAt: null, deletedBy: null };
}

async function upsert(resource, filter, values, owner) {
  const { model } = resourceRegistry[resource];
  return model.findOneAndUpdate(
    { ...filter, organization: owner.organization || null },
    { $set: { ...values, ...audit(owner) } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

export async function seedDemoData() {
  const superAdminRole = await Role.findOne({ slug: "super-admin", isActive: true, deletedAt: null });
  const owner = superAdminRole && await User.findOne({ roles: superAdminRole._id, email: { $not: /^api-check-/ }, status: "active", emailVerifiedAt: { $ne: null }, deletedAt: null }).sort({ createdAt: 1 });
  if (!owner) throw new Error("An active Super Admin is required before seeding demo data");

  const builder = await upsert("builders", { name: "Horizon Developers" }, { name: "Horizon Developers", email: "sales@horizon-demo.example", phone: "+91-9000000101", website: "https://example.com/horizon", status: "active", description: `${marker} builder` }, owner);
  const project = await upsert("projects", { name: "Horizon Greens" }, { name: "Horizon Greens", builder: builder._id, status: "under-construction", city: "Pune", area: "Baner", description: `${marker} residential project`, completionDate: new Date("2027-12-31") }, owner);
  const property = await upsert("properties", { reference: "DEMO-PROP-001" }, { title: "Horizon Greens 3 BHK", reference: "DEMO-PROP-001", status: "available", priceMinor: 1250000000, currency: "INR", assignedAgent: owner._id, description: `${marker} premium apartment`, propertyType: "apartment", bedrooms: 3, bathrooms: 3, areaSqFt: 1680, address: "Baner Road", city: "Pune", amenities: ["Clubhouse", "Parking", "Security"], featured: true, slug: "horizon-greens-3-bhk-demo", seoTitle: "Horizon Greens 3 BHK", seoDescription: "Demo premium property in Pune" }, owner);
  await upsert("leads", { email: "aarav.lead@example.com" }, { name: "Aarav Mehta", email: "aarav.lead@example.com", phone: "+91-9000000201", status: "qualified", source: "website", score: 82, assignedTo: owner._id }, owner);
  const customer = await upsert("customers", { phone: "+91-9000000301" }, { firstName: "Priya", lastName: "Sharma", email: "priya.customer@example.com", phone: "+91-9000000301", status: "active", assignedAgent: owner._id, notes: `${marker} customer interested in Pune properties` }, owner);
  const booking = await upsert("bookings", { property: property._id, customer: customer._id }, { property: property._id, customer: customer._id, agent: owner._id, status: "confirmed", totalMinor: 5000000, currency: "INR", bookedAt: now }, owner);
  const chat = await upsert("chats", { title: `${marker} customer conversation` }, { title: `${marker} customer conversation`, participants: [owner._id], lastMessageAt: now }, owner);

  await Promise.all([
    upsert("visits", { customer: customer._id, property: property._id }, { customer: customer._id, property: property._id, agent: owner._id, scheduledAt: tomorrow, status: "scheduled", feedback: `${marker} scheduled property tour` }, owner),
    upsert("tasks", { title: `${marker}: Follow up with Aarav` }, { title: `${marker}: Follow up with Aarav`, assignee: owner._id, status: "pending", priority: "high", dueAt: tomorrow }, owner),
    upsert("appointments", { title: `${marker}: Booking consultation` }, { title: `${marker}: Booking consultation`, owner: owner._id, attendeeName: "Priya Sharma", status: "scheduled", startsAt: tomorrow, endsAt: new Date(tomorrow.getTime() + 60 * 60 * 1000) }, owner),
    upsert("invoices", { number: "DEMO-INV-001" }, { number: "DEMO-INV-001", customer: customer._id, booking: booking._id, status: "sent", currency: "INR", lines: [{ description: "Booking advance", quantity: 1, unitPriceMinor: 5000000 }], totalMinor: 5000000, dueAt: nextWeek }, owner),
    upsert("payments", { reference: "DEMO-PAY-001" }, { booking: booking._id, reference: "DEMO-PAY-001", amountMinor: 5000000, currency: "INR", status: "paid", paidAt: now }, owner),
    upsert("documents", { publicId: "estateflow-demo/customer-kyc" }, { name: "Customer KYC", category: "identity", url: "https://example.com/demo/customer-kyc.pdf", publicId: "estateflow-demo/customer-kyc", mimeType: "application/pdf", size: 245760, ownerType: "Customer", ownerId: customer._id, visibility: "private" }, owner),
    upsert("support-tickets", { subject: `${marker}: Payment receipt request` }, { subject: `${marker}: Payment receipt request`, description: "Customer requested a downloadable payment receipt.", status: "open", priority: "medium", requester: owner._id, assignee: owner._id }, owner),
    upsert("blogs", { slug: "estateflow-demo-home-buying-guide" }, { title: "A Practical Home Buying Guide", slug: "estateflow-demo-home-buying-guide", summary: "A demo guide for first-time buyers.", content: "Review location, legal documents, financing, amenities, and possession timelines before booking.", status: "published", publishedAt: now }, owner),
    upsert("knowledge-base", { slug: "estateflow-demo-booking-process" }, { title: "How the Booking Process Works", slug: "estateflow-demo-booking-process", summary: "Demo booking workflow documentation.", content: "Select a property, schedule a visit, confirm terms, pay the booking amount, and receive an invoice.", status: "published", publishedAt: now }, owner),
    upsert("campaigns", { name: `${marker} Pune Launch` }, { name: `${marker} Pune Launch`, channel: "email", status: "scheduled", subject: "Discover Horizon Greens", content: "Explore premium homes in Baner, Pune.", scheduledAt: tomorrow, audienceSize: 250 }, owner),
    upsert("property-media", { publicId: "estateflow-demo/horizon-greens-cover" }, { property: property._id, kind: "image", title: "Horizon Greens exterior", url: "https://images.example.com/demo/horizon-greens.jpg", publicId: "estateflow-demo/horizon-greens-cover", alt: "Horizon Greens apartment exterior", order: 1, featured: true }, owner),
    upsert("favorites", { user: owner._id, property: property._id }, { user: owner._id, property: property._id }, owner),
    upsert("notes", { ownerType: "Customer", ownerId: customer._id, content: `${marker}: Prefers a west-facing unit.` }, { ownerType: "Customer", ownerId: customer._id, content: `${marker}: Prefers a west-facing unit.`, pinned: true }, owner),
    upsert("enquiries", { email: "rohan.enquiry@example.com" }, { name: "Rohan Verma", email: "rohan.enquiry@example.com", phone: "+91-9000000401", property: property._id, source: "property-portal", message: "Please share the floor plan and payment schedule.", status: "new", assignedTo: owner._id }, owner),
    upsert("testimonials", { customerName: "Neha Kapoor" }, { customerName: "Neha Kapoor", designation: "Homeowner", content: "The team made our property search clear and efficient.", rating: 5, status: "published" }, owner),
    upsert("faqs", { question: "Can I schedule a property visit online?" }, { question: "Can I schedule a property visit online?", answer: "Yes. Select an available property and choose a convenient visit time.", category: "visits", order: 1, status: "published" }, owner),
    upsert("communication-templates", { name: `${marker} Visit Reminder`, channel: "email" }, { name: `${marker} Visit Reminder`, channel: "email", subject: "Your property visit is tomorrow", content: "Hello {{name}}, this is a reminder for your scheduled property visit.", variables: ["name", "property", "visitTime"], status: "active" }, owner),
    upsert("messages", { chat: chat._id, content: `${marker}: Your property visit has been scheduled.` }, { chat: chat._id, sender: owner._id, content: `${marker}: Your property visit has been scheduled.`, readBy: [{ user: owner._id, readAt: now }] }, owner),
    upsert("notifications", { user: owner._id, title: `${marker} visit reminder` }, { user: owner._id, type: "visit-reminder", title: `${marker} visit reminder`, message: "A customer visit is scheduled for tomorrow.", link: "/visits" }, owner),
    upsert("activities", { title: `${marker} dataset initialized` }, { actor: owner._id, type: "demo.seeded", title: `${marker} dataset initialized`, description: "Persistent demonstration records were synchronized.", resourceType: "Project", resourceId: project._id, occurredAt: now }, owner),
  ]);

  return { owner: owner.email, resources: Object.keys(resourceRegistry).length, marker };
}
