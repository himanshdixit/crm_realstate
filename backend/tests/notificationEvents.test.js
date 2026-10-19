import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notificationEventHelpers } from "../src/services/notificationEventService.js";
import { notificationReminderHelpers } from "../src/jobs/notificationReminderJob.js";

describe("automatic notification helpers", () => {
  it("deduplicates recipient identifiers", () => {
    assert.deepEqual(notificationEventHelpers.ids(["user-1", ["user-1", "user-2"], null]), ["user-1", "user-2"]);
  });
  it("creates safe internal CRM links", () => {
    assert.equal(notificationEventHelpers.safeLink("tasks", { title: "Call buyer today" }), "/tasks?search=Call%20buyer%20today");
  });
  it("uses a readable user name in Super Admin activity alerts", () => {
    assert.equal(notificationEventHelpers.recordName("users", { firstName: "Riya", lastName: "Sharma" }), "Riya Sharma");
  });
  it("uses stable ISO timestamps for reminder deduplication", () => {
    assert.equal(notificationReminderHelpers.dateKey("2026-09-07T10:00:00.000Z"), "2026-09-07T10:00:00.000Z");
  });
});
