"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPasswordSchema } from "@/validations/authSchemas";
import { authService } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });
  const submit = handleSubmit(async ({ password }) => { try { await authService.resetPassword(token, password); toast.success("Password reset successfully"); } catch (error) { toast.error(apiErrorMessage(error)); } });
  if (!token) return <p className="text-rose-600">This reset link is missing its security token.</p>;
  if (isSubmitSuccessful) return <div><h1 className="text-3xl font-bold">Password updated</h1><p className="mt-3 text-muted">All previous sessions were signed out.</p><Button asChild className="mt-6"><Link href="/login">Sign in</Link></Button></div>;
  return <form onSubmit={submit} className="w-full max-w-md space-y-5" noValidate><div><p className="text-sm font-semibold text-brand-600">Account security</p><h1 className="mt-2 text-3xl font-bold">Choose a new password</h1></div><Input label="New password" type="password" error={errors.password?.message} {...register("password")} /><Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} /><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Updating…" : "Update password"}</Button></form>;
}
