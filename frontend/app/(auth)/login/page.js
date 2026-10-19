import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { Brand } from "@/components/layout/Brand";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden"><Brand /></div>
      <p className="mt-8 text-sm font-semibold text-brand-600 lg:mt-0">Welcome back</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Sign in to your workspace</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Use the account provided by your organization administrator.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">Need a customer account? <Link href="/register" className="font-semibold text-brand-600">Register</Link></p>
      <p className="mt-8 text-center text-xs leading-5 text-muted">By continuing, you agree to your organization’s acceptable-use and data policies.</p>
    </div>
  );
}
