import { db } from "@/db/drizzle";
import { type User, userTable } from "@/db/schema";
import {
	type AsyncResult,
	type AsyncResultEmpty,
	SafeResultWrapper,
	srOk,
	srOkEmpty,
} from "@/lib/safe-result";
import { userNameSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { hashPassword } from "./password";

export function verifyUsernameInput(username: string): boolean {
	return userNameSchema.safeParse(username).success;
}

export async function createUser(
	email: string,
	firstName: string,
	lastName: string,
	password: string,
): AsyncResult<User> {
	const hashedPassword = await hashPassword(password);

	const updateWatcher = await SafeResultWrapper.direct(
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

	if (!updateWatcher.success) {
		return updateWatcher;
	}

	return srOk(updateWatcher.value[0]);
}

export async function getUserById(id: string): AsyncResult<User | undefined> {
	const selectWatcher = await SafeResultWrapper.direct(
		db.query.userTable.findFirst({
			where: eq(userTable.id, id),
		}),
	);

	if (!selectWatcher.success) {
		return selectWatcher;
	}

	const user = selectWatcher.value;

	return srOk(user);
}

export async function getUserByEmail(
	email: string,
): AsyncResult<User | undefined> {
	const selectWatcher = await SafeResultWrapper.direct(
		db.query.userTable.findFirst({
			where: eq(userTable.email, email),
		}),
	);

	if (!selectWatcher.success) {
		return selectWatcher;
	}

	const user = selectWatcher.value;

	return srOk(user);
}

export async function updateUserPassword(
	userId: string,
	password: string,
): AsyncResultEmpty {
	const hashedPassword = await hashPassword(password);

	const updateWatcher = await SafeResultWrapper.direct(
		db
			.update(userTable)
			.set({ hashedPassword })
			.where(eq(userTable.id, userId)),
	);

	if (!updateWatcher.success) {
		return updateWatcher;
	}

	return srOkEmpty();
}
