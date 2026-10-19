import { param, query } from "express-validator";

export const notificationListValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50").toInt(),
  query("unreadOnly").optional().isBoolean().withMessage("unreadOnly must be boolean").toBoolean(),
];
export const notificationIdValidators = [param("notificationId").isMongoId().withMessage("A valid notification ID is required")];
