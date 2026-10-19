import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
export const metadata = { title: "Create account" };
export default function RegisterPage() { return <div className="w-full max-w-xl"><p className="text-sm font-semibold text-brand-600">Get started</p><h1 className="mt-2 text-3xl font-bold">Create your customer account</h1><p className="mt-3 text-sm text-muted">Team member accounts are provisioned by an administrator.</p><RegisterForm /><p className="mt-6 text-center text-sm text-muted">Already registered? <Link className="font-semibold text-brand-600" href="/login">Sign in</Link></p></div>; }
