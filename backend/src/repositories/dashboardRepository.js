import { Appointment } from "../models/Appointment.js";
import { Activity } from "../models/Activity.js";
import { Booking } from "../models/Booking.js";
import { Lead } from "../models/Lead.js";
import { Notification } from "../models/Notification.js";
import { Payment } from "../models/Payment.js";
import { Property } from "../models/Property.js";
import { Permission } from "../models/Permission.js";
import { Role } from "../models/Role.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

function monthStart(date = new Date()) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); }
function previousMonthStart(date = new Date()) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)); }
function dayBounds(date = new Date()) { const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); return { start, end: new Date(start.getTime() + 86400000) }; }

async function countTrend(model, base, dateField = "createdAt") {
  const current = monthStart();
  const previous = previousMonthStart();
  const [row = {}] = await model.aggregate([
    { $match: base },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      currentCount: { $sum: { $cond: [{ $gte: [`$${dateField}`, current] }, 1, 0] } },
      previousCount: { $sum: { $cond: [{ $and: [{ $gte: [`$${dateField}`, previous] }, { $lt: [`$${dateField}`, current] }] }, 1, 0] } },
    } },
  ]);
  const { total = 0, currentCount = 0, previousCount = 0 } = row;
  const trendPercent = previousCount === 0 ? (currentCount > 0 ? 100 : 0) : Math.round(((currentCount - previousCount) / previousCount) * 1000) / 10;
  return { total, currentCount, previousCount, trendPercent };
}

export const dashboardRepository = {
  async administration() {
    const activeRecord = { deletedAt: null };
    const [users, roles, permissions, statusCounts] = await Promise.all([
      User.find(activeRecord)
        .select("firstName lastName email phone avatar roles directPermissions deniedPermissions organization status emailVerifiedAt lastLoginAt createdAt")
        .sort({ createdAt: -1, _id: 1 })
        .lean(),
      Role.find(activeRecord)
        .select("name slug description permissions organization isSystem isActive")
        .sort({ isSystem: -1, name: 1 })
        .lean(),
      Permission.find({ isActive: true })
        .select("key name description resource action isSystem isActive")
        .sort({ resource: 1, action: 1 })
        .lean(),
      User.aggregate([
        { $match: activeRecord },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    return { users, roles, permissions, statusCounts };
  },

  async summary(scope) {
    const common = { organization: scope.organization, deletedAt: null };
    const propertyFilter = scope.customer ? { ...common, status: "available" } : common;
    const bookingFilter = { ...common, ...(scope.customer ? { customer: scope.userId } : {}) };
    const [properties, leads, bookings, revenue, convertedLeads, unreadNotifications] = await Promise.all([
      countTrend(Property, propertyFilter),
      scope.customer ? Promise.resolve({ total: 0, currentCount: 0, previousCount: 0, trendPercent: 0 }) : countTrend(Lead, common),
      countTrend(Booking, bookingFilter, "bookedAt"),
      scope.customer ? Promise.resolve({ total: 0, current: 0, previous: 0 }) : Payment.aggregate([
        { $match: { ...common, status: "paid" } },
        { $group: {
          _id: null,
          total: { $sum: "$amountMinor" },
          current: { $sum: { $cond: [{ $gte: ["$paidAt", monthStart()] }, "$amountMinor", 0] } },
          previous: { $sum: { $cond: [{ $and: [{ $gte: ["$paidAt", previousMonthStart()] }, { $lt: ["$paidAt", monthStart()] }] }, "$amountMinor", 0] } },
        } },
      ]).then((rows) => rows[0] || { total: 0, current: 0, previous: 0 }),
      scope.customer ? Promise.resolve(0) : Lead.countDocuments({ ...common, status: "converted" }),
      Notification.countDocuments({ user: scope.userId, readAt: null }),
    ]);
    const revenueMinor = revenue.total || 0;
    const currentRevenue = revenue.current || 0;
    const previousRevenue = revenue.previous || 0;
    const revenueTrendPercent = previousRevenue === 0 ? (currentRevenue > 0 ? 100 : 0) : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 1000) / 10;
    return { properties, leads: { ...leads, converted: convertedLeads, conversionRate: leads.total ? Math.round((convertedLeads / leads.total) * 1000) / 10 : 0 }, bookings, revenue: { totalMinor: revenueMinor, currentMonthMinor: currentRevenue, trendPercent: revenueTrendPercent, currency: "INR" }, unreadNotifications };
  },

  revenue(scope, months) {
    if (scope.customer) return Promise.resolve([]);
    const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0); start.setUTCMonth(start.getUTCMonth() - months + 1);
    return Payment.aggregate([{ $match: { organization: scope.organization, deletedAt: null, status: "paid", paidAt: { $gte: start } } }, { $group: { _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } }, amountMinor: { $sum: "$amountMinor" }, payments: { $sum: 1 } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);
  },

  groupCounts(model, scope, field) {
    if (scope.customer) return Promise.resolve([]);
    return model.aggregate([{ $match: { organization: scope.organization, deletedAt: null } }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]);
  },

  topAgents(scope, limit = 5) {
    if (scope.customer) return Promise.resolve([]);
    return Lead.aggregate([{ $match: { organization: scope.organization, deletedAt: null, assignedTo: { $ne: null } } }, { $group: { _id: "$assignedTo", leads: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] } } } }, { $sort: { converted: -1, leads: -1 } }, { $limit: limit }, { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $project: { _id: 0, userId: "$_id", name: { $concat: ["$user.firstName", " ", "$user.lastName"] }, avatar: "$user.avatar.url", leads: 1, converted: 1, conversionRate: { $cond: [{ $gt: ["$leads", 0] }, { $multiply: [{ $divide: ["$converted", "$leads"] }, 100] }, 0] } } }]);
  },

  async work(scope) {
    const { start, end } = dayBounds();
    const common = { organization: scope.organization, deletedAt: null };
    const [tasks, appointments] = await Promise.all([
      Task.find({ ...common, assignee: scope.userId, status: { $in: ["pending", "in-progress"] }, dueAt: { $gte: start, $lt: end } }).select("title status priority dueAt").sort({ priority: -1, dueAt: 1 }).limit(6).lean(),
      Appointment.find({ ...common, owner: scope.userId, status: "scheduled", startsAt: { $gte: new Date() } }).select("title attendeeName status startsAt endsAt").sort({ startsAt: 1 }).limit(6).lean(),
    ]);
    return { tasks, appointments };
  },

  activity(scope) {
    if (scope.customer) return Promise.resolve([]);
    return Activity.find({ organization: scope.organization, deletedAt: null }).select("actor type title description resourceType resourceId occurredAt").sort({ occurredAt: -1 }).limit(8).populate("actor", "firstName lastName avatar").lean();
  },

  recentTransactions(scope) {
    if (scope.customer) return Payment.find({ organization: scope.organization, status: "paid" }).populate({ path: "booking", match: { customer: scope.userId }, select: "customer property" }).sort({ paidAt: -1 }).limit(6).lean().then((rows) => rows.filter((row) => row.booking));
    return Payment.find({ organization: scope.organization, deletedAt: null }).sort({ createdAt: -1 }).limit(6).lean();
  },

  notifications(scope) {
    return Notification.find({ user: scope.userId, deletedAt: null }).select("type title message readAt link createdAt").sort({ createdAt: -1 }).limit(6).lean();
  },
};

export const dashboardDateHelpers = { monthStart, previousMonthStart, dayBounds };
