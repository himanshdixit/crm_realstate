const actions = {
  users: ["read", "create", "update", "delete", "restore", "manage-sessions"],
  roles: ["read", "create", "update", "delete", "manage"],
  permissions: ["read", "manage"],
  teams: ["read", "create", "update", "delete"],
  properties: ["read", "create", "update", "delete", "restore", "publish", "feature"],
  projects: ["read", "create", "update", "delete", "restore"],
  builders: ["read", "create", "update", "delete", "restore"],
  leads: ["read", "create", "update", "delete", "restore", "assign", "convert", "export"],
  customers: ["read", "create", "update", "delete", "restore", "export"],
  visits: ["read", "create", "update", "delete", "restore"],
  bookings: ["read", "create", "update", "delete", "restore", "approve", "cancel"],
  tasks: ["read", "create", "update", "delete", "restore", "assign"],
  appointments: ["read", "create", "update", "delete", "restore"],
  invoices: ["read", "create", "update", "delete", "restore", "send"],
  payments: ["read", "create", "update", "delete", "restore", "approve", "refund"],
  reports: ["read", "create", "export"],
  documents: ["read", "create", "update", "delete", "restore"],
  notifications: ["read", "create", "update", "delete", "restore", "manage"],
  settings: ["read", "manage"],
  audit: ["read", "create", "update", "delete", "restore", "export"],
  dashboard: ["read"],
  support: ["read", "create", "update", "delete", "restore", "assign"],
  content: ["read", "create", "update", "delete", "restore", "publish"],
  marketing: ["read", "create", "update", "delete", "restore", "send"],
  enquiries: ["read", "create", "update", "delete", "restore", "assign"],
};

export const PERMISSION_DEFINITIONS = Object.freeze(
  Object.entries(actions).flatMap(([resource, resourceActions]) =>
    resourceActions.map((action) => ({
      key: `${resource}.${action}`,
      resource,
      action,
      name: `${action.replaceAll("-", " ")} ${resource}`,
    })),
  ),
);

export const ALL_PERMISSION_KEYS = Object.freeze(PERMISSION_DEFINITIONS.map(({ key }) => key));
