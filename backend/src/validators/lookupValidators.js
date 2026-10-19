import { param, query } from "express-validator";
import { lookupRegistry } from "../config/lookupRegistry.js";
import { resourceRegistry } from "../config/resourceRegistry.js";

export const lookupValidators = [
  param("type").isIn(Object.keys(lookupRegistry)).withMessage("Unsupported lookup type"),
  query("context").isIn(Object.keys(resourceRegistry)).withMessage("A valid form context is required"),
  query("q").optional().trim().isLength({ max: 100 }),
  query("role").optional().trim().matches(/^[a-z-]{2,40}$/),
  query("ids").optional().customSanitizer((value) => Array.isArray(value) ? value : String(value).split(",").filter(Boolean)).isArray({ max: 20 }).custom((values) => values.every((value) => /^[a-f\d]{24}$/i.test(value))).withMessage("Selected lookup IDs must be valid"),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];
