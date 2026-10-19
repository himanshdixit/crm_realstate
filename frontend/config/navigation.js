import {
  FiActivity, FiBarChart2, FiBriefcase, FiLayers, FiCalendar, FiCheckSquare,
  FiCreditCard, FiFileText, FiGrid, FiHeadphones, FiHome, FiMessageSquare,
  FiSettings, FiTarget, FiUsers, FiBookOpen, FiSend,
} from "react-icons/fi";

export const navigation = [
  { label: "Overview", href: "/dashboard", icon: FiGrid, available: true },
  { label: "Properties", href: "/properties", icon: FiHome, available: true },
  { label: "Leads", href: "/leads", icon: FiTarget, available: true },
  { label: "Lead pipeline", href: "/leads/pipeline", icon: FiLayers, available: true },
  { label: "Customers", href: "/customers", icon: FiUsers, available: true },
  { label: "Projects", href: "/projects", icon: FiLayers, available: true },
  { label: "Builders", href: "/builders", icon: FiUsers, available: true },
  { label: "Visits", href: "/visits", icon: FiActivity, available: true },
  { label: "Bookings", href: "/bookings", icon: FiBriefcase, available: true },
  { label: "Tasks", href: "/tasks", icon: FiCheckSquare, available: true },
  { label: "Appointments", href: "/appointments", icon: FiCalendar, available: true },
  { label: "Payments", href: "/payments", icon: FiCreditCard, available: true },
  { label: "Invoices", href: "/invoices", icon: FiFileText, available: true },
  { label: "Reports", href: "/reports", icon: FiBarChart2, available: true },
  { label: "Favorites", href: "/favorites", icon: FiHome, available: true },
  { label: "Property media", href: "/property-media", icon: FiLayers, available: true },
  { label: "Notes", href: "/notes", icon: FiFileText, available: true },
  { label: "Enquiries", href: "/enquiries", icon: FiTarget, available: true },
  { label: "Documents", href: "/documents", icon: FiFileText, available: true },
  { label: "Chats", href: "/chats", icon: FiMessageSquare, available: true },
  { label: "Notifications", href: "/notifications", icon: FiActivity, available: true },
  { label: "Activity", href: "/activities", icon: FiActivity, available: true },
];

export const utilityNavigation = [
  { label: "Campaigns", href: "/campaigns", icon: FiSend, available: true },
  { label: "Blog", href: "/blogs", icon: FiBookOpen, available: true },
  { label: "Knowledge", href: "/knowledge-base", icon: FiBookOpen, available: true },
  { label: "Support", href: "/support-tickets", icon: FiHeadphones, available: true },
  { label: "Templates", href: "/communication-templates", icon: FiSend, available: true },
  { label: "Testimonials", href: "/testimonials", icon: FiUsers, available: true },
  { label: "FAQs", href: "/faqs", icon: FiBookOpen, available: true },
  { label: "Settings", href: "/settings", icon: FiSettings, available: true },
];
