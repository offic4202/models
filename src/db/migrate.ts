import { runMigrations } from "@kilocode/app-builder-db";
import { getDb } from "./index";

// Only run migrations if database credentials are available
const dbUrl = process.env.DB_URL;
const dbToken = process.env.DB_TOKEN;

if (!dbUrl || !dbToken) {
  console.log("Skipping migrations - no database credentials configured");
  process.exit(0);
}

const db = getDb();
await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations completed");
