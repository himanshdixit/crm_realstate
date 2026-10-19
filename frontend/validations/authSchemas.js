import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required").min(8, "Password must contain at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

const strongPassword = z.string().min(10, "Use at least 10 characters").max(128).regex(/[a-z]/, "Add a lowercase letter").regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number");
export const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase()) });

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name").max(80),
  lastName: z.string().trim().min(1, "Enter your last name").max(80),
  email: z.string().trim().email("Enter a valid email").transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(20).optional(),
  password: strongPassword,
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const resetPasswordSchema = z.object({ password: strongPassword, confirmPassword: z.string() }).refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1, "Current password is required"), newPassword: strongPassword, confirmPassword: z.string() }).refine((values) => values.newPassword === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
