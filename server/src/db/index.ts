import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

export const client = postgres(env.DATABASE_URL);
export const db = drizzle(env.DATABASE_URL, { schema, logger: false });
