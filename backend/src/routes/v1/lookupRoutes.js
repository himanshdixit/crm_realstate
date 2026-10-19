import { Router } from "express";
import { list } from "../../controllers/lookupController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { lookupValidators } from "../../validators/lookupValidators.js";

export const lookupRouter = Router();
lookupRouter.get("/:type", authenticate, lookupValidators, validate, asyncHandler(list));
