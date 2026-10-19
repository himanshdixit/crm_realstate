import { body, param } from "express-validator";

const email = () => body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail();
const password = (field = "password") => body(field).isString().isLength({ min: 10, max: 128 }).withMessage("Password must contain 10 to 128 characters").matches(/[a-z]/).withMessage("Password requires a lowercase letter").matches(/[A-Z]/).withMessage("Password requires an uppercase letter").matches(/[0-9]/).withMessage("Password requires a number");

export const registerValidators = [body("firstName").trim().isLength({ min: 2, max: 80 }), body("lastName").trim().isLength({ min: 1, max: 80 }), email(), body("phone").optional({ values: "falsy" }).trim().isLength({ min: 7, max: 20 }), password(), body("timezone").optional().isString().isLength({ max: 80 })];
export const loginValidators = [email(), body("password").isString().notEmpty(), body("rememberMe").optional().isBoolean().toBoolean()];
export const emailValidators = [email()];
export const tokenValidators = [body("token").isString().isLength({ min: 32, max: 512 })];
export const resetPasswordValidators = [...tokenValidators, password("password")];
export const changePasswordValidators = [body("currentPassword").isString().notEmpty(), password("newPassword")];
export const profileValidators = [body("firstName").optional().trim().isLength({ min: 2, max: 80 }), body("lastName").optional().trim().isLength({ min: 1, max: 80 }), body("phone").optional({ values: "falsy" }).trim().isLength({ min: 7, max: 20 }), body("timezone").optional().isString().isLength({ max: 80 }), body("locale").optional().isString().isLength({ min: 2, max: 10 })];
export const sessionIdValidators = [param("sessionId").isUUID().withMessage("A valid session ID is required")];
