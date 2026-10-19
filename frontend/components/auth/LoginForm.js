"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { routes } from "@/constants/routes";
import { apiErrorMessage } from "@/services/apiClient";
import { authService } from "@/services/authService";
import { loginSchema } from "@/validations/authSchemas";
import { sessionLoaded } from "@/redux/slices/authSlice";
import { useHydrated } from "@/hooks/useHydrated";

function LoginFormSkeleton() {
  return (
    <div className="mt-8 space-y-5" role="status" aria-label="Loading sign-in form">
      <div className="space-y-2"><span className="block h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><span className="block h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" /></div>
      <div className="space-y-2"><span className="block h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><span className="block h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" /></div>
      <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
      <div className="h-12 animate-pulse rounded-xl bg-brand-200 dark:bg-brand-950" />
    </div>
  );
}

export function LoginForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const session = await authService.login(values);
      dispatch(sessionLoaded(session));
      toast.success("Welcome back");
      router.replace(routes.dashboard);
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Sign in failed"));
    }
  });

  if (!hydrated) return <LoginFormSkeleton />;

  return (
    <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
      <div className="relative">
        <FiMail className="pointer-events-none absolute start-3.5 top-[2.65rem] z-10 text-muted" />
        <Input label="Work email" type="email" autoComplete="email" placeholder="name@company.com" className="ps-10" error={errors.email?.message} {...register("email")} />
      </div>
      <div className="relative">
        <FiLock className="pointer-events-none absolute start-3.5 top-[2.65rem] z-10 text-muted" />
        <Input label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className="px-10" error={errors.password?.message} {...register("password")} />
        <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="focus-ring absolute end-2.5 top-[2.25rem] grid size-9 place-items-center rounded-lg text-muted" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 font-medium"><input type="checkbox" className="size-4 rounded border-default accent-brand-600" {...register("rememberMe")} /> Remember me</label>
        <Link href="/forgot-password" className="focus-ring rounded font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : <>Sign in securely <FiArrowRight /></>}</Button>
    </form>
  );
}
