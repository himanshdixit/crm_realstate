"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";

export function VerifyEmailResult() {
  const token = useSearchParams().get("token");
  const verificationStarted = useRef(false);
  const [result, setResult] = useState(() => token
    ? { state: "loading", message: "Verifying your email…" }
    : { state: "error", message: "The verification token is missing." });

  useEffect(() => {
    if (!token || verificationStarted.current) return;
    verificationStarted.current = true;
    authService.verifyEmail(token)
      .then(() => setResult({ state: "success", message: "Your email is verified. Your account is ready." }))
      .catch((error) => setResult({ state: "error", message: apiErrorMessage(error) }));
  }, [token]);

  return <div className="w-full max-w-md"><p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Email verification</p><h1 className="mt-3 text-3xl font-bold">{result.state === "loading" ? "Please wait" : result.state === "success" ? "Account activated" : "Verification failed"}</h1><p className="mt-4 leading-7 text-muted">{result.message}</p>{result.state !== "loading" && <Button asChild className="mt-7"><Link href="/login">Continue to sign in</Link></Button>}</div>;
}
