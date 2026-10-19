"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerSchema } from "@/validations/authSchemas";
import { authService } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" } });
  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => { try { await authService.register({ ...values, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }); toast.success("Check your email to activate your account"); } catch (error) { toast.error(apiErrorMessage(error)); } });
  if (isSubmitSuccessful) return <div className="rounded-2xl bg-accent-50 p-6 text-accent-900 dark:bg-accent-950 dark:text-accent-100"><h2 className="text-xl font-bold">Registration received</h2><p className="mt-2 text-sm leading-6">Open the verification link sent to your email, then sign in.</p><Button asChild className="mt-5"><Link href="/login">Return to sign in</Link></Button></div>;
  return <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate><Input label="First name" error={errors.firstName?.message} {...register("firstName")} /><Input label="Last name" error={errors.lastName?.message} {...register("lastName")} /><Input containerClassName="sm:col-span-2" label="Work email" type="email" error={errors.email?.message} {...register("email")} /><Input containerClassName="sm:col-span-2" label="Phone (optional)" error={errors.phone?.message} {...register("phone")} /><Input label="Password" type="password" error={errors.password?.message} {...register("password")} /><Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} /><Button type="submit" size="lg" className="sm:col-span-2" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</Button></form>;
}
