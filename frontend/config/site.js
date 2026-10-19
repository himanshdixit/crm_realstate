export const siteConfig = Object.freeze({
  name: process.env.NEXT_PUBLIC_APP_NAME || "EstateFlow",
  description: "A secure, modern workspace for real estate sales and operations.",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Kolkata",
});
