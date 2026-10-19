import { PageHeader } from "@/components/common/PageHeader";
import { SecurityPanel } from "@/components/auth/SecurityPanel";
export const metadata = { title: "Account security" };
export default function SecurityPage() { return <div className="space-y-7"><PageHeader eyebrow="Security" title="Password and sessions" description="Protect your account and revoke devices you no longer recognize." /><SecurityPanel /></div>; }
