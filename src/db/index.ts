import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof createDatabase> | null = null;

// Lazy initialization - only creates database connection when needed
// This prevents build failures when DB_URL/DB_TOKEN aren't set during build
export function getDb() {
  if (!dbInstance) {
    dbInstance = createDatabase(schema);
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
