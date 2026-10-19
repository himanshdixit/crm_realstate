import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommunicationTemplate, Enquiry, Faq, PropertyMedia, Testimonial } from "../src/models/ExtendedCrmModels.js";

describe("extended CRM model validation", () => {
  it("accepts valid property media metadata", () => {
    const error = new PropertyMedia({ property: "507f1f77bcf86cd799439011", kind: "floor-plan", url: "https://res.cloudinary.com/demo/plan.png", publicId: "properties/plan" }).validateSync();
    assert.equal(error, undefined);
  });
  it("rejects invalid testimonial ratings and FAQ states", () => {
    assert.ok(new Testimonial({ customerName: "Asha", content: "Excellent", rating: 8 }).validateSync()?.errors.rating);
    assert.ok(new Faq({ question: "Question?", answer: "Answer", status: "removed" }).validateSync()?.errors.status);
  });
  it("requires channel-safe communication templates", () => {
    assert.ok(new CommunicationTemplate({ name: "Follow up", channel: "telegram", content: "Hello" }).validateSync()?.errors.channel);
    assert.equal(new CommunicationTemplate({ name: "Follow up", channel: "whatsapp", content: "Hello {{name}}" }).validateSync(), undefined);
  });
  it("validates enquiry status transitions at the data boundary", () => {
    assert.ok(new Enquiry({ name: "Buyer", status: "deleted" }).validateSync()?.errors.status);
  });
});
