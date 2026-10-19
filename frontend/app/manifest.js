import { siteConfig } from "@/config/site";

export default function manifest() {
  return { name: siteConfig.name, short_name: "EstateFlow", description: siteConfig.description, start_url: "/dashboard", display: "standalone", background_color: "#f8fafc", theme_color: "#6366f1" };
}
