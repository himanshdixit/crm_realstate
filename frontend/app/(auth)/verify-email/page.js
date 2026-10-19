import { Suspense } from "react";
import { PageLoader } from "@/components/common/PageLoader";
import { VerifyEmailResult } from "@/components/auth/VerifyEmailResult";
export const metadata = { title: "Verify email" };
export default function VerifyEmailPage() { return <Suspense fallback={<PageLoader />}><VerifyEmailResult /></Suspense>; }
