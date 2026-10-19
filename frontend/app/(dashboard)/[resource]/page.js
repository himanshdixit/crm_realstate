import { notFound } from "next/navigation";
import { ResourcePage } from "@/components/common/ResourcePage";
import { resourceConfigs } from "@/config/resources";

export async function generateMetadata({ params }) {
  const { resource } = await params; const config = resourceConfigs[resource];
  return { title: config?.title || "CRM module" };
}

export default async function RegisteredResourcePage({ params }) {
  const { resource } = await params; const config = resourceConfigs[resource];
  if (!config) notFound();
  return <ResourcePage resource={resource} config={config} />;
}
