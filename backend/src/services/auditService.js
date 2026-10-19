import { AuditLog } from "../models/AuditLog.js";

export const auditService = {
  record({ request, actor = null, organization = null, action, resourceType, resourceId = null, metadata = {} }) {
    return AuditLog.create({ actor, organization, action, resourceType, resourceId, metadata, requestId: request?.id, ipAddress: request?.ip, userAgent: request?.get?.("user-agent"), occurredAt: new Date() });
  },
};
