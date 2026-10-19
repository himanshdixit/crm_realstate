import { Router } from "express";
import * as controller from "../../controllers/resourceController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { csrfProtection } from "../../middlewares/csrfProtection.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { resourceRegistry } from "../../config/resourceRegistry.js";

export const resourceRouter = Router();
resourceRouter.use((request, _response, next) => {
  const resource = request.path.split("/").filter(Boolean)[0];
  if (!resourceRegistry[resource]) return next("router");
  next();
});
resourceRouter.use(authenticate);
resourceRouter.get("/:resource", asyncHandler(controller.list));
resourceRouter.post("/:resource", csrfProtection, asyncHandler(controller.create));
resourceRouter.post("/:resource/bulk-delete", csrfProtection, asyncHandler(controller.bulkRemove));
resourceRouter.patch("/:resource/bulk-update", csrfProtection, asyncHandler(controller.bulkUpdate));
resourceRouter.get("/:resource/:id", asyncHandler(controller.get));
resourceRouter.patch("/:resource/:id", csrfProtection, asyncHandler(controller.update));
resourceRouter.delete("/:resource/:id", csrfProtection, asyncHandler(controller.remove));
resourceRouter.post("/:resource/:id/restore", csrfProtection, asyncHandler(controller.restore));
