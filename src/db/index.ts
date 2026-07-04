import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

function createNeonDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

type Db = ReturnType<typeof createNeonDb>;

// Without DATABASE_URL in dev, fall back to an in-memory Postgres seeded
// with sample data (see src/db/dev/) so the site runs without Neon
// credentials. Production always uses Neon.
async function createDb(): Promise<Db> {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    const { createDevDb } = await import("./dev");
    return (await createDevDb()) as unknown as Db;
  }
  return createNeonDb();
}

// Cached on globalThis so the seeded dev db survives HMR module reloads.
const globalForDb = globalThis as typeof globalThis & { __dgrcDb?: Promise<Db> };

export const db = await (globalForDb.__dgrcDb ??= createDb());
