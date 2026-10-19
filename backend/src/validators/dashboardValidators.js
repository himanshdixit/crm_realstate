import { query } from "express-validator";

export const overviewValidators = [query("months").optional().isInt({ min: 6, max: 12 }).withMessage("months must be between 6 and 12").toInt()];
