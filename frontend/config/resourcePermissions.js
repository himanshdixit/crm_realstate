const aliases = Object.freeze({
  "property-media": "properties",
  favorites: "properties",
  notes: "customers",
  "support-tickets": "support",
  blogs: "content",
  "knowledge-base": "content",
  testimonials: "content",
  faqs: "content",
  campaigns: "marketing",
  "communication-templates": "marketing",
  chats: "notifications",
  messages: "notifications",
  notifications: "notifications",
  activities: "audit",
});

export function resourcePermission(resource) { return aliases[resource] || resource; }
