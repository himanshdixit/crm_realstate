import { query } from "express-validator";

export const globalSearchValidators = [
  query("q").trim().isLength({ min: 2, max: 100 }).withMessage("Search must contain 2 to 100 characters"),
  query("limit").optional().isInt({ min: 1, max: 30 }).withMessage("Limit must be between 1 and 30").toInt(),
];
