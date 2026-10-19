import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resourceConfigs } from "../config/resources.js";
import { resourcePermission } from "../config/resourcePermissions.js";
import { resourceSchema } from "../utils/resourceSchema.js";

describe("CRM resource configuration", () => {
  it("defines unique writable fields and visible columns for every module", () => {
    for (const [name, config] of Object.entries(resourceConfigs)) {
      assert.ok(config.title, `${name} requires a title`);
      assert.ok(config.fields.length, `${name} requires fields`);
      assert.ok(config.columns.length, `${name} requires columns`);
      assert.equal(new Set(config.fields.map(({ name: field }) => field)).size, config.fields.length, `${name} fields must be unique`);
      for (const field of config.fields.filter(({ type }) => type === "select")) assert.ok(field.options.length, `${name}.${field.name} requires options`);
      for (const field of config.fields.filter(({ type }) => type === "reference" || type === "reference-multi")) {
        assert.ok(field.lookup || (field.lookupBy && field.lookupMap), `${name}.${field.name} requires a lookup source`);
      }
    }
  });
  it("maps shared modules to the backend permission namespace", () => {
    assert.equal(resourcePermission("property-media"), "properties");
    assert.equal(resourcePermission("testimonials"), "content");
    assert.equal(resourcePermission("communication-templates"), "marketing");
    assert.equal(resourcePermission("messages"), "notifications");
    assert.equal(resourcePermission("activities"), "audit");
    assert.equal(resourcePermission("leads"), "leads");
  });
});

describe("generated resource validation", () => {
  const schema = resourceSchema([
    { name: "name", label: "Name", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "lines", label: "Lines", type: "json", required: true },
    { name: "notes", label: "Notes", type: "text", required: false },
    { name: "customer", label: "Customer", type: "reference", required: true },
    { name: "participants", label: "Participants", type: "reference-multi", required: true },
  ]);
  it("coerces numbers and parses structured JSON", () => {
    const result = schema.parse({ name: "Booking", amount: "12500", lines: '[{"quantity":1}]', notes: "", customer: "507f1f77bcf86cd799439011", participants: ["507f191e810c19729de860ea"] });
    assert.equal(result.amount, 12500);
    assert.deepEqual(result.lines, [{ quantity: 1 }]);
  });
  it("rejects raw labels where a relationship ID is required", () => {
    assert.equal(schema.safeParse({ name: "Booking", amount: "10", lines: "[]", customer: "John Doe", participants: [] }).success, false);
  });
  it("rejects empty required fields and malformed JSON", () => {
    assert.equal(schema.safeParse({ name: "", amount: "10", lines: "{" }).success, false);
  });
});
