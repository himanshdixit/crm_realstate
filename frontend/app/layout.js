import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers/AppProviders";
import { ThemeScript } from "@/components/common/ThemeScript";
import "./globals.css";

export const metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang={siteConfig.defaultLocale} suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
