import { notificationService } from "../services/notificationService.js";
import { successResponse } from "../utils/ApiResponse.js";

export async function inbox(request, response) {
  const result = await notificationService.inbox(request.auth.userId, request.validated);
  response.set("Cache-Control", "private, no-cache");
  response.json(successResponse({ message: "Notifications loaded", data: { items: result.items, unreadCount: result.unreadCount }, meta: result.meta }));
}
export async function markRead(request, response) { const data = await notificationService.markRead(request.auth.userId, request.validated.notificationId); response.json(successResponse({ message: "Notification marked as read", data })); }
export async function markAllRead(request, response) { const data = await notificationService.markAllRead(request.auth.userId); response.json(successResponse({ message: "All notifications marked as read", data })); }
export async function dismiss(request, response) { await notificationService.dismiss(request.auth.userId, request.validated.notificationId); response.json(successResponse({ message: "Notification dismissed" })); }
