import { createDatabase } from "@kilocode/app-builder-db";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

let dbInstance: SqliteRemoteDatabase<typeof schema> | null = null;

// Check if we're in a build/generation context
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NEXT_PHASE === 'phase-development-build' ||
                    !process.env.DB_URL;

console.log("DB Module loaded, build time check:", { 
  NEXT_PHASE: process.env.NEXT_PHASE, 
  isBuildTime,
  hasDBUrl: !!process.env.DB_URL 
});

// Lazy initialization - only creates database connection when actually needed at runtime
export function getDb(): SqliteRemoteDatabase<typeof schema> | null {
  // Skip initialization during build time
  if (isBuildTime) {
    console.log("Skipping database initialization during build");
    // Return null during build to allow type checking to pass
    return null;
  }

  if (!dbInstance) {
    // Use absolute path for Docker
    const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || "file:./data/streamray.db";
    
    // Convert relative path to absolute path if needed
    let finalUrl = dbUrl;
    if (dbUrl.startsWith("file:")) {
      const filePath = dbUrl.replace("file:", "");
      if (!filePath.startsWith("/")) {
        // Relative path - make it absolute to /app/data
        finalUrl = `file:/app/data/streamray.db`;
      }
    }
    
    console.log("Initializing database with URL:", finalUrl);
    
    // Create database with schema
    dbInstance = createDatabase(schema, {
      url: finalUrl,
    });
    
    console.log("Database initialized successfully");
  }
  return dbInstance;
}

// Type for the database export that TypeScript understands
export type DbType = SqliteRemoteDatabase<typeof schema>;

// Export db for direct usage - must be typed properly for TypeScript
// This allows imports like: import { db } from "@/db"; db.select()
// At runtime, getDb() will return the actual database or null during build
export const db: SqliteRemoteDatabase<typeof schema> = null as unknown as SqliteRemoteDatabase<typeof schema>;
