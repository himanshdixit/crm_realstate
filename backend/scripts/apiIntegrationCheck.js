import assert from "node:assert/strict";
import { connectDatabase, disconnectDatabase } from "../src/database/mongoose.js";
import { resourceRegistry } from "../src/config/resourceRegistry.js";
import { Role } from "../src/models/Role.js";
import { User } from "../src/models/User.js";
import { RefreshToken } from "../src/models/RefreshToken.js";
import { LoginHistory } from "../src/models/LoginHistory.js";
import { EmailVerificationToken } from "../src/models/EmailVerificationToken.js";
import { PasswordResetToken } from "../src/models/PasswordResetToken.js";
import { AuditLog } from "../src/models/AuditLog.js";
import { Activity } from "../src/models/Activity.js";
import { hashPassword, hashToken } from "../src/utils/hashing.js";

const apiUrl = process.env.INTEGRATION_API_URL || "http://127.0.0.1:5000/api/v1";
const runId = `api-check-${Date.now()}`;
const password = "Integration!Pass123";
const changedPassword = "Integration!Pass456";
const results = [];
const jar = new Map();
let admin;
let registeredUserId;

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\/v1$/.test(apiUrl)) {
  throw new Error("Integration checks are restricted to a local API URL");
}

function absorbCookies(response) {
  const values = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const value of values) {
    const [pair] = value.split(";");
    const separator = pair.indexOf("=");
    jar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

async function request(method, path, { body, expected = [200], csrf = false } = {}) {
  const headers = { Accept: "application/json", Origin: "http://localhost:3000", "X-Device-Fingerprint": runId };
  if (jar.size) headers.Cookie = [...jar].map(([key, value]) => `${key}=${value}`).join("; ");
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (csrf) headers["X-CSRF-Token"] = jar.get("crm_csrf") || "";
  const response = await fetch(`${apiUrl}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual", signal: AbortSignal.timeout(20000) });
  absorbCookies(response);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("json") ? await response.json() : Buffer.from(await response.arrayBuffer());
  assert(expected.includes(response.status), `${method} ${path}: expected ${expected.join("/")}, got ${response.status}: ${Buffer.isBuffer(data) ? "binary response" : JSON.stringify(data)}`);
  results.push(`${method} ${path} -> ${response.status}`);
  process.stdout.write(`${results.at(-1)}\n`);
  return { response, data };
}

async function create(resource, body) {
  const { data } = await request("POST", `/${resource}`, { body, expected: [201], csrf: true });
  assert(data.success && data.data?._id, `${resource} create did not return a record`);
  await request("GET", `/${resource}/${data.data._id}`);
  return data.data;
}

async function cleanup() {
  if (admin?._id) {
    for (const { model } of Object.values(resourceRegistry)) await model.deleteMany({ $or: [{ createdBy: admin._id }, { updatedBy: admin._id }] });
    await Activity.deleteMany({ $or: [{ actor: admin._id }, { createdBy: admin._id }] });
    await RefreshToken.deleteMany({ user: admin._id });
    await LoginHistory.deleteMany({ user: admin._id });
    await EmailVerificationToken.deleteMany({ user: admin._id });
    await PasswordResetToken.deleteMany({ user: admin._id });
    await AuditLog.collection.deleteMany({ actor: admin._id });
    await User.deleteOne({ _id: admin._id });
  }
  if (registeredUserId) {
    await RefreshToken.deleteMany({ user: registeredUserId });
    await LoginHistory.deleteMany({ user: registeredUserId });
    await EmailVerificationToken.deleteMany({ user: registeredUserId });
    await PasswordResetToken.deleteMany({ user: registeredUserId });
    await AuditLog.collection.deleteMany({ actor: registeredUserId });
    await User.deleteOne({ _id: registeredUserId });
  }
}

async function cleanupStaleChecks() {
  const stale = await User.find({ email: /^api-check-\d+(?:-registered)?@example\.com$/, createdAt: { $lt: new Date(Date.now() - 60000) } }).select("_id").lean();
  const ids = stale.map(({ _id }) => _id);
  if (!ids.length) return;
  for (const { model } of Object.values(resourceRegistry)) await model.deleteMany({ $or: [{ createdBy: { $in: ids } }, { updatedBy: { $in: ids } }] });
  await Activity.deleteMany({ $or: [{ actor: { $in: ids } }, { createdBy: { $in: ids } }] });
  await Promise.all([
    RefreshToken.deleteMany({ user: { $in: ids } }), LoginHistory.deleteMany({ user: { $in: ids } }),
    EmailVerificationToken.deleteMany({ user: { $in: ids } }), PasswordResetToken.deleteMany({ user: { $in: ids } }),
    AuditLog.collection.deleteMany({ actor: { $in: ids } }), User.deleteMany({ _id: { $in: ids } }),
  ]);
}

async function run() {
  await connectDatabase();
  await cleanupStaleChecks();
  const role = await Role.findOne({ slug: "super-admin", isActive: true, deletedAt: null });
  assert(role, "Seeded super-admin role was not found; run npm run seed first");
  admin = await User.create({ firstName: "API", lastName: "Auditor", email: `${runId}@example.com`, passwordHash: await hashPassword(password), roles: [role._id], status: "active", emailVerifiedAt: new Date() });

  const live = await request("GET", "/health/live");
  assert.equal(live.data.success, true);
  const ready = await request("GET", "/health/ready");
  assert.equal(ready.data.data.database.status, "up");
  assert.equal(ready.response.headers.get("access-control-allow-origin"), "http://localhost:3000");

  const registrationEmail = `${runId}-registered@example.com`;
  const registration = await request("POST", "/auth/register", { body: { firstName: "Registered", lastName: "User", email: registrationEmail, password, confirmPassword: password, timezone: "Asia/Kolkata" }, expected: [201] });
  registeredUserId = registration.data.data.userId;
  const verificationToken = `${runId}-verification-token`;
  await EmailVerificationToken.deleteMany({ user: registeredUserId });
  await EmailVerificationToken.create({ user: registeredUserId, tokenHash: hashToken(verificationToken), expiresAt: new Date(Date.now() + 60000) });
  await request("POST", "/auth/verify-email", { body: { token: verificationToken } });
  const repeatedVerification = await request("POST", "/auth/verify-email", { body: { token: verificationToken } });
  assert.equal(repeatedVerification.data.data.alreadyVerified, true);
  await request("POST", "/auth/resend-verification", { body: { email: "nobody@example.com" } });

  const login = await request("POST", "/auth/login", { body: { email: admin.email, password, rememberMe: true } });
  assert(login.data.data.permissions.includes("properties.create"));
  await request("GET", "/auth/me");
  const sessions = await request("GET", "/auth/sessions");
  assert(sessions.data.data.some((session) => session.current));
  await request("PATCH", "/auth/profile", { body: { firstName: "API", lastName: "Auditor Updated", timezone: "Asia/Kolkata", locale: "en" }, csrf: true });
  await request("POST", "/auth/refresh");

  const dashboard = await request("GET", "/dashboard/overview?months=6");
  assert(Array.isArray(dashboard.data.data.administration?.adminUsers), "Super Admin dashboard did not include the normal-admin list");
  assert(Array.isArray(dashboard.data.data.administration?.users), "Super Admin dashboard did not include the user list");
  assert(Array.isArray(dashboard.data.data.administration?.roles), "Super Admin dashboard did not include role permissions");
  assert(dashboard.data.data.administration.users.some((user) => user.id === String(admin._id)), "Super Admin dashboard omitted the authenticated account");
  for (const resource of Object.keys(resourceRegistry)) await request("GET", `/${resource}?page=1&limit=1&sort=-createdAt`);
  await request("GET", "/leads/pipeline");

  const now = new Date();
  const later = new Date(now.getTime() + 3600000).toISOString();
  const property = await create("properties", { title: runId, reference: runId, status: "available", priceMinor: 10000000, currency: "INR" });
  const lead = await create("leads", { name: `${runId} Lead`, email: `${runId}-lead@example.com`, phone: `${runId}-lead`, source: "integration", score: 80 });
  const customer = await create("customers", { firstName: "Integration", lastName: "Customer", phone: `${runId}-customer`, status: "active" });
  const builder = await create("builders", { name: runId, status: "active" });
  await create("projects", { name: runId, builder: builder._id, city: "Pune" });
  const booking = await create("bookings", { property: property._id, customer: customer._id, agent: admin._id, totalMinor: 100000, currency: "INR", bookedAt: now.toISOString() });
  const chat = await create("chats", { title: runId, participants: [admin._id], lastMessageAt: now.toISOString() });

  const payloads = {
    visits: { customer: customer._id, property: property._id, agent: admin._id, scheduledAt: later },
    tasks: { title: runId, assignee: admin._id, dueAt: later },
    appointments: { title: runId, owner: admin._id, startsAt: now.toISOString(), endsAt: later },
    invoices: { number: runId, customer: customer._id, booking: booking._id, lines: [{ description: "Audit", quantity: 1, unitPriceMinor: 1000 }], totalMinor: 1000, dueAt: later },
    payments: { booking: booking._id, reference: runId, amountMinor: 1000 },
    documents: { name: runId, category: "audit", url: "https://example.com/audit.pdf", publicId: runId, mimeType: "application/pdf", size: 10, ownerType: "Customer", ownerId: customer._id },
    "support-tickets": { subject: runId, description: "Integration audit", requester: admin._id },
    blogs: { title: runId, slug: runId, content: "Integration audit" },
    "knowledge-base": { title: runId, slug: `${runId}-kb`, content: "Integration audit" },
    campaigns: { name: runId, channel: "email", content: "Integration audit" },
    "property-media": { property: property._id, url: "https://example.com/image.jpg", publicId: runId },
    favorites: { user: admin._id, property: property._id },
    notes: { ownerType: "Customer", ownerId: customer._id, content: runId },
    enquiries: { name: runId, property: property._id, source: "integration" },
    testimonials: { customerName: runId, content: "Integration audit", rating: 5 },
    faqs: { question: `${runId}?`, answer: "Integration audit", category: "audit" },
    "communication-templates": { name: runId, channel: "email", content: "Integration audit", variables: ["name"] },
    messages: { chat: chat._id, sender: admin._id, content: runId },
    notifications: { user: admin._id, type: "audit", title: runId, message: "Integration audit" },
    activities: { actor: admin._id, type: "audit.check", title: runId, occurredAt: now.toISOString() },
  };
  for (const [resource, payload] of Object.entries(payloads)) await create(resource, payload);

  await request("PATCH", `/properties/${property._id}/feature`, { body: { featured: true }, csrf: true });
  await request("PATCH", `/bookings/${booking._id}/approve`, { body: {}, csrf: true });
  await request("PATCH", `/bookings/${booking._id}/cancel`, { body: {}, csrf: true });
  await request("POST", `/leads/${lead._id}/convert`, { body: {}, expected: [201], csrf: true });

  await request("PATCH", `/builders/${builder._id}`, { body: { description: "updated" }, csrf: true });
  await request("DELETE", `/builders/${builder._id}`, { csrf: true });
  await request("POST", `/builders/${builder._id}/restore`, { body: {}, csrf: true });
  const bulkOne = await create("builders", { name: `${runId}-bulk-one` });
  const bulkTwo = await create("builders", { name: `${runId}-bulk-two` });
  await request("PATCH", "/builders/bulk-update", { body: { ids: [bulkOne._id, bulkTwo._id], changes: { status: "inactive" } }, csrf: true });
  await request("POST", "/builders/bulk-delete", { body: { ids: [bulkOne._id, bulkTwo._id] }, csrf: true });

  for (const format of ["excel", "pdf"]) {
    const report = await request("GET", `/reports/${format}?resource=properties`);
    assert(report.data.length > 0, `${format} report was empty`);
  }

  await request("POST", "/auth/change-password", { body: { currentPassword: password, newPassword: changedPassword, confirmPassword: changedPassword }, csrf: true });
  await request("POST", "/auth/forgot-password", { body: { email: admin.email } });
  const resetToken = `${runId}-reset-token`;
  await PasswordResetToken.deleteMany({ user: admin._id });
  await PasswordResetToken.create({ user: admin._id, tokenHash: hashToken(resetToken), expiresAt: new Date(Date.now() + 60000) });
  await request("POST", "/auth/reset-password", { body: { token: resetToken, password, confirmPassword: password } });

  process.stdout.write(`${JSON.stringify({ success: true, database: "Codex_realstate_db", checks: results.length, resources: Object.keys(resourceRegistry).length, endpoints: results }, null, 2)}\n`);
}

run().catch((error) => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => { await cleanup(); await disconnectDatabase(); });
