import "server-only";

import { db } from "@/db/drizzle";
import { type Session, type User, sessionTable, userTable } from "@/db/schema";
import {
	type AsyncWatcherResult,
	type AsyncWatcherResultEmpty,
	Watcher,
	watcherOk,
	watcherOkEmpty,
} from "@/lib/watcher";
import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: number,
	flags: SessionFlags,
): AsyncWatcherResult<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified,
	};

	const insertResult = await Watcher.instance(
		db.insert(sessionTable).values(session),
	);

	// either maps to a session or safe error result
	const mappedInsertResult = insertResult.map((_) => session);

	// session or safe error result
	return mappedInsertResult.get();
}

export async function validateSessionToken(
	token: string,
): AsyncWatcherResult<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const activeSessionsInstance = await Watcher.instance(
		db
			.select({ user: userTable, session: sessionTable })
			.from(sessionTable)
			.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
			.where(eq(sessionTable.id, sessionId)),
	);

	const activeSessions = activeSessionsInstance.get();

	if (!activeSessions.success) {
		return activeSessions;
	}

	const resultingSession = activeSessions.value[0];

	if (!resultingSession) {
		return {
			success: true,
			value: {
				session: null,
				user: null,
			},
		};
	}

	const { user, session } = resultingSession;

	if (Date.now() >= session.expiresAt.getTime()) {
		const deleteWatcher = await Watcher.direct(
			db.delete(sessionTable).where(eq(sessionTable.id, session.id)),
		);

		if (!deleteWatcher.success) {
			return deleteWatcher;
		}

		return watcherOk({ session: null, user: null });
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

		const updateWatcher = await Watcher.direct(
			db.update(sessionTable).set({ expiresAt: session.expiresAt }),
		);

		if (!updateWatcher.success) {
			return updateWatcher;
		}
	}
	return watcherOk({ session, user });
}

export async function invalidateSession(
	sessionId: string,
): AsyncWatcherResultEmpty {
	const deleteWatcher = await Watcher.direct(
		db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
	);

	if (!deleteWatcher.success) {
		return deleteWatcher;
	}

	return watcherOkEmpty();
}

export const getCurrentSession = cache(
	async (): AsyncWatcherResult<SessionValidationResult> => {
		const cks = await cookies();
		const token = cks.get("session")?.value ?? null;
		if (token === null) {
			return watcherOk({ session: null, user: null });
		}

		const result = await validateSessionToken(token);
		if (!result.success) {
			return watcherOk({ session: null, user: null });
		}

		return result;
	},
);

export async function setSessionTokenCookie(
	token: string,
	expiresAt: Date,
): Promise<void> {
	const cks = await cookies();
	cks.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cks = await cookies();
	cks.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0,
	});
}

export async function setSessionAs2FAVerified(
	sessionId: string,
): AsyncWatcherResultEmpty {
	const updateWatcher = await Watcher.direct(
		db
			.update(sessionTable)
			.set({ twoFactorVerified: true })
			.where(eq(sessionTable.id, sessionId)),
	);

	if (!updateWatcher.success) {
		return updateWatcher;
	}

	return watcherOkEmpty();
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type SessionFlags = {
	twoFactorVerified: boolean;
};
