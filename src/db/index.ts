import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof createDatabase> | null = null;

// Lazy initialization - only creates database connection when needed
// This prevents build failures when DB_URL/DB_TOKEN aren't set during build
export function getDb() {
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
// This object delegates to the actual database at runtime
export const db = new Proxy({} as ReturnType<typeof createDatabase>, {
  get(_, prop) {
    const database = getDb();
    return database[prop as keyof typeof database];
  }
});
