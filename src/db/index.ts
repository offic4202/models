import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof createDatabase> | null = null;

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
export function getDb() {
  // Skip initialization during build time
  if (isBuildTime) {
    console.log("Skipping database initialization during build");
    // Return a mock db object for build time to prevent crashes
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

// Export db as a convenience - uses lazy initialization internally
// Returns null during build time to prevent build failures
export const db = new Proxy({} as ReturnType<typeof createDatabase> | null, {
  get(_, prop) {
    // During build time, return undefined for any property access
    if (isBuildTime) {
      return undefined;
    }
    const database = getDb();
    if (!database) {
      return undefined;
    }
    return database[prop as keyof typeof database];
  }
});
