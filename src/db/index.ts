import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbUrl = process.env.DB_URL || "file:./data/streamray.db";

let dbPath = dbUrl.replace("file:", "");
if (!dbPath.startsWith("/")) {
  dbPath = path.join(process.cwd(), dbPath);
}

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("Initializing database at:", dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

async function runMigrations() {
  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

runMigrations().then(() => {
  console.log("Database ready");
});

export type DbType = typeof db;
