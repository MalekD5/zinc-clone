import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const client = new Pool({
	connectionString: process.env.DB_URL as string,
});

export const db = drizzle(client, { schema });
