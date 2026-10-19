import { logger } from "../src/config/logger.js";
import { connectDatabase, disconnectDatabase } from "../src/database/mongoose.js";
import { seedPermissions } from "./permissionsSeeder.js";
import { seedRoles } from "./rolesSeeder.js";
import { seedDemoData } from "./demoDataSeeder.js";

async function run() {
  await connectDatabase();
  const permissions = await seedPermissions();
  const roles = await seedRoles();
  logger.info("Reference data seeded", { permissions: permissions.length, roles: roles.length });
}

export async function runDemoSeed() {
  await connectDatabase();
  const result = await seedDemoData();
  logger.info("Demo CRM data seeded", result);
}

run()
  .catch((error) => {
    logger.error("Seeding failed", { error });
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
