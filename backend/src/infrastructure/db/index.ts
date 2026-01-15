import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

// ADR-002: SQLite (better-sqlite3 con modo WAL)
const sqlite = new Database(process.env.DATABASE_URL || "sqlite.db");
sqlite.pragma("journal_mode = WAL"); // Write-Ahead Logging para mejor concurrencia

export const db = drizzle(sqlite, { schema });
