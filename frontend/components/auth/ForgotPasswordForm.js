"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiErrorMessage } from "@/services/apiClient";
import { authService } from "@/services/authService";
import { emailSchema } from "@/validations/authSchemas";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
  const submit = handleSubmit(async ({ email }) => {
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  });
  if (sent) return <div className="w-full max-w-md"><span className="grid size-12 place-items-center rounded-2xl bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300"><FiMail size={22} /></span><h1 className="mt-6 text-3xl font-bold">Check your inbox</h1><p className="mt-3 leading-7 text-muted">If an account matches that address, password-reset instructions are on the way.</p><Button asChild variant="secondary" className="mt-7"><Link href="/login"><FiArrowLeft /> Return to sign in</Link></Button></div>;
  return (
    <div className="w-full max-w-md">
      <p className="text-sm font-semibold text-brand-600">Account recovery</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Reset your password</h1><p className="mt-3 leading-6 text-muted">Enter your work email. For privacy, the result is the same whether or not an account exists.</p>
      <form onSubmit={submit} className="mt-8 space-y-5" noValidate><Input label="Work email" type="email" autoComplete="email" placeholder="name@company.com" error={errors.email?.message} {...register("email")} /><Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send reset instructions"}</Button></form>
      <Button asChild variant="ghost" className="mt-5"><Link href="/login"><FiArrowLeft /> Back to sign in</Link></Button>
    </div>
  );
}
