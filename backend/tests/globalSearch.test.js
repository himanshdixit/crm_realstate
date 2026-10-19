import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { globalSearchHelpers } from "../src/services/globalSearchService.js";

describe("global search helpers", () => {
  it("formats resource labels and scalar result values", () => {
    assert.equal(globalSearchHelpers.readableResource("support-tickets"), "Support Tickets");
    assert.equal(globalSearchHelpers.textValue(["Mumbai", "Pune"]), "Mumbai, Pune");
    assert.equal(globalSearchHelpers.textValue({ unsafe: "object" }), "");
  });

  it("creates a module search destination for a matching record", () => {
    const result = globalSearchHelpers.resultFromRecord("properties", { searchFields: ["title", "reference", "city"] }, { _id: "record-1", title: "Horizon Greens", reference: "PROP-101", city: "Pune", status: "available" }, "Horizon Greens");
    assert.equal(result.title, "Horizon Greens");
    assert.equal(result.subtitle, "PROP-101 · Pune");
    assert.equal(result.href, "/properties?search=Horizon%20Greens");
  });
});
