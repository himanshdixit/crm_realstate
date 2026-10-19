import { Router } from "express";
import * as controller from "../../controllers/notificationController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { csrfProtection } from "../../middlewares/csrfProtection.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { notificationIdValidators, notificationListValidators } from "../../validators/notificationValidators.js";

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get("/", notificationListValidators, validate, asyncHandler(controller.inbox));
notificationRouter.patch("/read-all", csrfProtection, asyncHandler(controller.markAllRead));
notificationRouter.patch("/:notificationId/read", csrfProtection, notificationIdValidators, validate, asyncHandler(controller.markRead));
notificationRouter.delete("/:notificationId", csrfProtection, notificationIdValidators, validate, asyncHandler(controller.dismiss));
