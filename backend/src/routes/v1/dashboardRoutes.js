import { Router } from "express";
import { overview } from "../../controllers/dashboardController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { overviewValidators } from "../../validators/dashboardValidators.js";
import * as adminUserController from "../../controllers/adminUserController.js";
import { csrfProtection } from "../../middlewares/csrfProtection.js";
import { requireSuperAdmin } from "../../middlewares/requireSuperAdmin.js";
import { adminUserIdValidators, createAdminUserValidators, passwordAdminUserValidators, updateAdminUserValidators } from "../../validators/adminUserValidators.js";

export const dashboardRouter = Router();
dashboardRouter.get("/overview", authenticate, authorize("dashboard.read"), overviewValidators, validate, asyncHandler(overview));
dashboardRouter.post("/users", authenticate, requireSuperAdmin, csrfProtection, createAdminUserValidators, validate, asyncHandler(adminUserController.create));
dashboardRouter.patch("/users/:userId", authenticate, requireSuperAdmin, csrfProtection, updateAdminUserValidators, validate, asyncHandler(adminUserController.update));
dashboardRouter.patch("/users/:userId/password", authenticate, requireSuperAdmin, csrfProtection, passwordAdminUserValidators, validate, asyncHandler(adminUserController.setPassword));
dashboardRouter.delete("/users/:userId", authenticate, requireSuperAdmin, csrfProtection, adminUserIdValidators, validate, asyncHandler(adminUserController.remove));
