import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let client: Database | null = null;

/** Build the Drizzle client on first use so importing this module never
 *  requires DATABASE_URL at build time (only at request time). */
function getClient(): Database {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — add your Neon connection string.");
  }
  client = drizzle(neon(connectionString), { schema });
  return client;
}

/**
 * Drizzle client bound to Neon's HTTP driver, lazily initialized. Import
 * everywhere as `db`; property access forwards to the real client.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getClient() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
