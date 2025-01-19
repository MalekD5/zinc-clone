import { db } from "@/db/drizzle";
import { type User, userTable } from "@/db/schema";
import { userNameSchema } from "@/lib/validation";
import {
	type AsyncWatcherResult,
	type AsyncWatcherResultEmpty,
	Watcher,
	watcherOk,
	watcherOkEmpty,
} from "@/lib/watcher";
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
): AsyncWatcherResult<User> {
	const hashedPassword = await hashPassword(password);

	const updateWatcher = await Watcher.direct(
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

	return watcherOk(updateWatcher.value[0]);
}

export async function getUserById(
	id: string,
): AsyncWatcherResult<User | undefined> {
	const selectWatcher = await Watcher.direct(
		db.query.userTable.findFirst({
			where: eq(userTable.id, id),
		}),
	);

	if (!selectWatcher.success) {
		return selectWatcher;
	}

	const user = selectWatcher.value;

	return watcherOk(user);
}

export async function getUserByEmail(
	email: string,
): AsyncWatcherResult<User | undefined> {
	const selectWatcher = await Watcher.direct(
		db.query.userTable.findFirst({
			where: eq(userTable.email, email),
		}),
	);

	if (!selectWatcher.success) {
		return selectWatcher;
	}

	const user = selectWatcher.value;

	return watcherOk(user);
}

export async function updateUserPassword(
	userId: string,
	password: string,
): AsyncWatcherResultEmpty {
	const hashedPassword = await hashPassword(password);

	const updateWatcher = await Watcher.direct(
		db
			.update(userTable)
			.set({ hashedPassword })
			.where(eq(userTable.id, userId)),
	);

	if (!updateWatcher.success) {
		return updateWatcher;
	}

	return watcherOkEmpty();
}
