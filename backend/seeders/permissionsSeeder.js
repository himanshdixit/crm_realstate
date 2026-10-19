import { PERMISSION_DEFINITIONS } from "../src/constants/permissions.js";
import { Permission } from "../src/models/Permission.js";

export async function seedPermissions() {
  const operations = PERMISSION_DEFINITIONS.map((permission) => ({
    updateOne: {
      filter: { key: permission.key },
      update: { $set: { ...permission, isSystem: true, isActive: true } },
      upsert: true,
    },
  }));
  if (operations.length > 0) await Permission.bulkWrite(operations);
  return Permission.find({ key: { $in: PERMISSION_DEFINITIONS.map(({ key }) => key) } });
}
