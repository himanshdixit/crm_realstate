import { Router } from "express";
import * as controller from "../../controllers/authController.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { csrfProtection } from "../../middlewares/csrfProtection.js";
import { authRateLimiter } from "../../middlewares/rateLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { changePasswordValidators, emailValidators, loginValidators, profileValidators, registerValidators, resetPasswordValidators, sessionIdValidators, tokenValidators } from "../../validators/authValidators.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerValidators, validate, asyncHandler(controller.register));
authRouter.post("/verify-email", authRateLimiter, tokenValidators, validate, asyncHandler(controller.verifyEmail));
authRouter.post("/resend-verification", authRateLimiter, emailValidators, validate, asyncHandler(controller.resendVerification));
authRouter.post("/login", authRateLimiter, loginValidators, validate, asyncHandler(controller.login));
authRouter.post("/refresh", authRateLimiter, asyncHandler(controller.refresh));
authRouter.post("/forgot-password", authRateLimiter, emailValidators, validate, asyncHandler(controller.forgotPassword));
authRouter.post("/reset-password", authRateLimiter, resetPasswordValidators, validate, asyncHandler(controller.resetPassword));

authRouter.use(authenticate);
authRouter.get("/me", asyncHandler(controller.me));
authRouter.get("/sessions", asyncHandler(controller.sessions));
authRouter.patch("/profile", csrfProtection, profileValidators, validate, asyncHandler(controller.updateProfile));
authRouter.post("/change-password", csrfProtection, changePasswordValidators, validate, asyncHandler(controller.changePassword));
authRouter.post("/logout", csrfProtection, asyncHandler(controller.logout));
authRouter.post("/logout-all", csrfProtection, asyncHandler(controller.logoutAll));
authRouter.delete("/sessions/:sessionId", csrfProtection, sessionIdValidators, validate, asyncHandler(controller.deleteSession));
