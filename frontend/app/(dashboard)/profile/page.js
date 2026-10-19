import { PageHeader } from "@/components/common/PageHeader";
import { ProfileForm } from "@/components/auth/ProfileForm";
export const metadata = { title: "Profile" };
export default function ProfilePage() { return <div className="space-y-7"><PageHeader eyebrow="Account" title="Your profile" description="Keep your contact and regional preferences current." /><ProfileForm /></div>; }
