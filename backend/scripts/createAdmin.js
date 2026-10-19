import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../src/database/mongoose.js";
import { logger } from "../src/config/logger.js";
import { SYSTEM_ROLES } from "../src/constants/roles.js";
import { Role } from "../src/models/Role.js";
import { User } from "../src/models/User.js";
import { hashPassword } from "../src/utils/hashing.js";

async function run() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error("ADMIN_EMAIL and a strong ADMIN_PASSWORD are required");
  await connectDatabase();
  if (await User.exists({ email })) throw new Error("A user with ADMIN_EMAIL already exists; the script will not overwrite it");
  const role = await Role.findOne({ slug: SYSTEM_ROLES.SUPER_ADMIN, organization: null, isActive: true, deletedAt: null });
  if (!role) throw new Error("Super Admin role is missing. Run npm run seed first.");
  const user = await User.create({ firstName: process.env.ADMIN_FIRST_NAME || "System", lastName: process.env.ADMIN_LAST_NAME || "Administrator", email, passwordHash: await hashPassword(password), roles: [role._id], status: "active", emailVerifiedAt: new Date() });
  logger.info("Super administrator created", { userId: user.id, email: user.email });
}

run().catch((error) => { logger.error("Administrator creation failed", { error }); process.exitCode = 1; }).finally(disconnectDatabase);
