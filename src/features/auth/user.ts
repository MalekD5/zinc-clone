import { db } from "@/db/drizzle";
import { userTable } from "@/db/schema";
import { safePromise } from "@/lib/error";
import { eq } from "drizzle-orm";
import { hashPassword } from "./password";

export async function createUser(
	email: string,
	firstName: string,
	lastName: string,
	password: string,
) {
	const hashedPassword = await hashPassword(password);

	const [error, data] = await safePromise(
		db
			.insert(userTable)
			.values({
				email,
				displayName: `${firstName} ${lastName}`,
				hashedPassword,
				verified: false,
			})
			.returning(),
	);

	if (error) {
		return {
			ok: false,
			error,
		};
	}
	return data;
}

export async function getUserById(id: string) {
	return await db.select().from(userTable).where(eq(userTable.id, id));
}

export async function getUserByEmail(email: string) {
	return await db.select().from(userTable).where(eq(userTable.email, email));
}
