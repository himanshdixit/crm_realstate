import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { paginationMeta } from "../utils/pagination.js";

const visibleFields = "type title message readAt link createdAt";

export const notificationService = {
  async inbox(userId, { page = 1, limit = 15, unreadOnly = false }) {
    const filter = { user: userId, deletedAt: null, ...(unreadOnly ? { readAt: null } : {}) };
    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).select(visibleFields).sort({ createdAt: -1 }).skip(skip).limit(limit).maxTimeMS(5000).lean(),
      Notification.countDocuments(filter).maxTimeMS(5000),
      Notification.countDocuments({ user: userId, deletedAt: null, readAt: null }).maxTimeMS(5000),
    ]);
    return { items, unreadCount, meta: paginationMeta({ page, limit, total }) };
  },

  async markRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate({ _id: notificationId, user: userId, deletedAt: null }, { $set: { readAt: new Date() } }, { new: true }).select(visibleFields).lean();
    if (!notification) throw new ApiError(404, "Notification was not found", "NOTIFICATION_NOT_FOUND");
    return notification;
  },

  async markAllRead(userId) {
    const result = await Notification.updateMany({ user: userId, deletedAt: null, readAt: null }, { $set: { readAt: new Date() } });
    return { updatedCount: result.modifiedCount };
  },

  async dismiss(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate({ _id: notificationId, user: userId, deletedAt: null }, { $set: { deletedAt: new Date(), deletedBy: userId, updatedBy: userId } }, { new: true });
    if (!notification) throw new ApiError(404, "Notification was not found", "NOTIFICATION_NOT_FOUND");
  },
};
