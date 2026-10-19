import { Suspense } from "react";
import { PageLoader } from "@/components/common/PageLoader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
export const metadata = { title: "Choose a new password" };
export default function ResetPasswordPage() { return <Suspense fallback={<PageLoader />}><ResetPasswordForm /></Suspense>; }
