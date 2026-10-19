import mongoose from "mongoose";
import "../src/config/resourceRegistry.js";
import "../src/models/User.js";
import "../src/models/Role.js";
import "../src/models/Permission.js";
import { connectDatabase, disconnectDatabase } from "../src/database/mongoose.js";

try {
  await connectDatabase();
  const results = await Promise.all(mongoose.modelNames().map(async (name) => {
    await mongoose.model(name).createIndexes();
    return name;
  }));
  process.stdout.write(`Indexes verified for ${results.length} models\n`);
} finally {
  await disconnectDatabase();
}
