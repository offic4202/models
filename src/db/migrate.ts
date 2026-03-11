import { runMigrations } from "@kilocode/app-builder-db";
import { getDb } from "./index";

// Only run migrations if database credentials are available
const dbUrl = process.env.DB_URL;
const dbToken = process.env.DB_TOKEN;

console.log("DB_URL:", dbUrl);
console.log("DB_TOKEN:", dbToken ? "(set)" : "(not set)");

// For SQLite (file-based), run migrations to ensure tables exist
// For cloud databases (requires DB_TOKEN), run migrations
if (!dbUrl) {
  console.log("Skipping migrations - no DB_URL configured");
  process.exit(0);
}

// For SQLite, we still want to run migrations
const isSqlite = dbUrl.includes(".db") || dbUrl.startsWith("file:");

if (!isSqlite && !dbToken) {
  console.log("Skipping migrations - cloud database without token");
  process.exit(0);
}

console.log("Running database migrations...");

const db = getDb();
await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations completed");
