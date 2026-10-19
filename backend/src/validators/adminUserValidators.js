import { body, param } from "express-validator";

const userId = param("userId").isMongoId().withMessage("A valid user ID is required");
const roleIds = body("roleIds").isArray({ min: 1 }).withMessage("At least one role is required").custom((ids) => ids.every((id) => /^[a-f\d]{24}$/i.test(id))).withMessage("Every role ID must be valid");
const strongPassword = (field) => body(field).isString().isLength({ min: 10, max: 128 }).withMessage("Password must contain 10 to 128 characters").matches(/[a-z]/).withMessage("Password requires a lowercase letter").matches(/[A-Z]/).withMessage("Password requires an uppercase letter").matches(/[0-9]/).withMessage("Password requires a number");

export const createAdminUserValidators = [body("firstName").trim().isLength({ min: 2, max: 80 }), body("lastName").trim().isLength({ min: 1, max: 80 }), body("email").trim().isEmail().normalizeEmail(), body("phone").optional({ values: "falsy" }).trim().isLength({ min: 7, max: 20 }), strongPassword("password"), roleIds, body("status").optional().isIn(["pending", "active", "suspended", "locked", "disabled"]), body("emailVerified").optional().isBoolean().toBoolean()];
export const updateAdminUserValidators = [userId, body("firstName").optional().trim().isLength({ min: 2, max: 80 }), body("lastName").optional().trim().isLength({ min: 1, max: 80 }), body("email").optional().trim().isEmail().normalizeEmail(), body("phone").optional({ values: "falsy" }).trim().isLength({ min: 7, max: 20 }), body("roleIds").optional().isArray({ min: 1 }).custom((ids) => ids.every((id) => /^[a-f\d]{24}$/i.test(id))), body("status").optional().isIn(["pending", "active", "suspended", "locked", "disabled"]), body("emailVerified").optional().isBoolean().toBoolean()];
export const passwordAdminUserValidators = [userId, strongPassword("password")];
export const adminUserIdValidators = [userId];
