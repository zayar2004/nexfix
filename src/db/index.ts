import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Please check your .env file.");
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 60,
  connect_timeout: 60,
  max_lifetime: 60 * 10,
});

export const db = drizzle(client, { schema });
