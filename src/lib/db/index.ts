import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "sqlite.db");

const globalForDb = globalThis as unknown as {
  _db: BetterSQLite3Database<typeof schema> | undefined;
};

function createDb(): BetterSQLite3Database<typeof schema> {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db: BetterSQLite3Database<typeof schema> =
  globalForDb._db ?? (globalForDb._db = createDb());
