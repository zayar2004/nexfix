import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please check your .env file. " +
    "See .env.example for the required format."
  );
}

const client = postgres(connectionString, { 
  prepare: false,
  // Add these for better stability on flaky networks (like mobile)
  max: 5, 
  idle_timeout: 20, 
  connect_timeout: 15,
  max_lifetime: 60 * 5 // 5 minutes
});

export const db = drizzle(client, { schema });
