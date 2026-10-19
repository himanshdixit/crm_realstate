import { logger } from "../src/config/logger.js";
import { connectDatabase, disconnectDatabase } from "../src/database/mongoose.js";
import { seedDemoData } from "./demoDataSeeder.js";

try {
  await connectDatabase();
  const result = await seedDemoData();
  logger.info("Demo CRM data seeded", result);
} catch (error) {
  logger.error("Demo data seeding failed", { error });
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
