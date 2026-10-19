import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Brand({ compact = false }) {
  return (
    <Link href="/dashboard" className={`focus-ring flex items-center overflow-hidden rounded-xl bg-white ${compact ? "h-11 w-12" : "h-12 w-[184px] px-2"}`} aria-label={`${siteConfig.name} dashboard`}>
      <Image src="/branding/estateflow-logo.png" alt="EstateFlow" width={752} height={202} priority className={`max-w-none object-contain object-left ${compact ? "h-10 w-auto" : "h-auto w-full"}`} />
    </Link>
  );
}
