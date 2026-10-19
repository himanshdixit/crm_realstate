import { Router } from "express";
import { search } from "../../controllers/globalSearchController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { globalSearchValidators } from "../../validators/globalSearchValidators.js";

export const searchRouter = Router();
searchRouter.get("/", authenticate, globalSearchValidators, validate, asyncHandler(search));
