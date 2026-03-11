import { runMigrations, createDatabase } from "@kilocode/app-builder-db";
import { getDb } from "./index";
import * as schema from "./schema";

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

// Try to get existing db, or create new one
let db = getDb();

// If db is null (build time), create a new instance for migrations
if (!db) {
  console.log("Creating new database instance for migrations...");
  db = createDatabase(schema, { url: dbUrl });
}

await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations completed");
