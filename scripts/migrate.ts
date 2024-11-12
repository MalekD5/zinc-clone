import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { client } from "../src/db/drizzle";

async function main() {
	await migrate(drizzle(client), {
		migrationsFolder: "migrations",
	});

	await client.end();
}

main();
