/**
 * Local development bootstrap.
 *
 * Spins up an in-memory MongoDB (no system install needed), points the app at
 * it, and then starts the normal server from index.ts.
 *
 * Run with:  npm run dev:local
 *
 * NOTE: Data is EPHEMERAL — it resets every time you stop the process.
 * This is meant for local testing only, never for real data.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@local.dev";
const ADMIN_PASSWORD = "Admin@1234";

/** Wait until the app's mongoose connection is ready. */
async function waitForConnection(timeoutMs = 15000) {
  const start = Date.now();
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for MongoDB connection");
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

/** Create (or reset) a local admin user for testing. */
async function seedAdmin() {
  await waitForConnection();
  const User = (await import("./src/user/user.model")).default;
  const password = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        first_name: "Local",
        last_name: "Admin",
        email: ADMIN_EMAIL,
        password,
        type: "ADMIN",
        isVerified: true,
      },
    },
    { upsert: true, new: true }
  );
  console.log("👑 Admin seeded ->  email:", ADMIN_EMAIL, " password:", ADMIN_PASSWORD);
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri("mlm");

  // Set BEFORE importing index.ts. dotenv.config() (inside index.ts) does not
  // override variables that are already set, so this local URI wins over .env.
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  // Ensure a JWT secret exists even if .env is missing one.
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    process.env.JWT_SECRET = "local-dev-only-secret-change-me-0123456789abcd";
  }

  console.log("🧪 In-memory MongoDB started for local dev");
  console.log("   URI:", uri);

  // Starting index.ts triggers its startServer() (connects + listens).
  await import("./index");

  // Seed a known admin so you can log in as admin during local testing.
  await seedAdmin();

  const shutdown = async () => {
    console.log("\nShutting down local dev server & in-memory MongoDB...");
    await mongod.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start local dev environment:", err);
  process.exit(1);
});
