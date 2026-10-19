import { Appointment } from "../models/Appointment.js";
import { Task } from "../models/Task.js";
import { Visit } from "../models/Visit.js";
import { logger } from "../config/logger.js";
import { notificationEventService } from "../services/notificationEventService.js";

const intervalMs = 5 * 60 * 1000;
let running = false;

function dateKey(date) { return new Date(date).toISOString(); }

export async function runNotificationReminders(now = new Date()) {
  if (running) return { skipped: true, created: 0 };
  running = true;
  try {
    const upcoming = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const [tasks, appointments, visits] = await Promise.all([
      Task.find({ deletedAt: null, status: { $in: ["pending", "in-progress"] }, dueAt: { $lte: upcoming } }).select("title assignee dueAt organization").sort({ dueAt: 1 }).limit(500).lean(),
      Appointment.find({ deletedAt: null, status: "scheduled", startsAt: { $gte: now, $lte: upcoming } }).select("title owner startsAt organization").sort({ startsAt: 1 }).limit(500).lean(),
      Visit.find({ deletedAt: null, status: "scheduled", scheduledAt: { $gte: now, $lte: upcoming } }).select("agent scheduledAt organization").sort({ scheduledAt: 1 }).limit(500).lean(),
    ]);
    const reminders = [
      ...tasks.map((task) => ({ userId: task.assignee, organization: task.organization, type: task.dueAt < now ? "task.overdue" : "task.due-soon", title: task.dueAt < now ? `Task overdue: ${task.title}` : `Task due soon: ${task.title}`, message: task.dueAt < now ? "This task is overdue and still requires attention." : "This task is due within the next 24 hours.", link: `/tasks?search=${encodeURIComponent(task.title)}`, dedupeKey: `task-reminder:${task._id}:${dateKey(task.dueAt)}` })),
      ...appointments.map((appointment) => ({ userId: appointment.owner, organization: appointment.organization, type: "appointment.reminder", title: `Upcoming appointment: ${appointment.title}`, message: "This appointment starts within the next 24 hours.", link: `/appointments?search=${encodeURIComponent(appointment.title)}`, dedupeKey: `appointment-reminder:${appointment._id}:${dateKey(appointment.startsAt)}` })),
      ...visits.map((visit) => ({ userId: visit.agent, organization: visit.organization, type: "visit.reminder", title: "Upcoming property visit", message: "A scheduled property visit starts within the next 24 hours.", link: "/visits", dedupeKey: `visit-reminder:${visit._id}:${dateKey(visit.scheduledAt)}` })),
    ];
    const created = (await Promise.all(reminders.map((reminder) => notificationEventService.reminder(reminder)))).reduce((sum, count) => sum + count, 0);
    if (created) logger.info("Automatic notification reminders created", { created, candidates: reminders.length });
    return { skipped: false, created, candidates: reminders.length };
  } catch (error) {
    logger.error("Notification reminder job failed", { error });
    return { skipped: false, created: 0, error: true };
  } finally { running = false; }
}

export function startNotificationReminderJob() {
  void runNotificationReminders();
  const timer = setInterval(() => void runNotificationReminders(), intervalMs);
  timer.unref();
  return timer;
}

export const notificationReminderHelpers = { dateKey };
