import "server-only";

import { db } from "@/db/drizzle";
import { type Session, type User, sessionTable, userTable } from "@/db/schema";
import {
	type AsyncResult,
	type AsyncResultEmpty,
	SafeResultWrapper,
	srOk,
	srOkEmpty,
} from "@/lib/safe-result";
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
): AsyncResult<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified,
	};

	const insertResult = await SafeResultWrapper.instance(
		db.insert(sessionTable).values(session),
	);

	// either maps to a session or safe error result
	const mappedInsertResult = insertResult.map((_) => session);

	// session or safe error result
	return mappedInsertResult.get();
}

export async function validateSessionToken(
	token: string,
): AsyncResult<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const activeSessionsInstance = await SafeResultWrapper.instance(
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
		const deleteWatcher = await SafeResultWrapper.direct(
			db.delete(sessionTable).where(eq(sessionTable.id, session.id)),
		);

		if (!deleteWatcher.success) {
			return deleteWatcher;
		}

		return srOk({ session: null, user: null });
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

		const updateWatcher = await SafeResultWrapper.direct(
			db.update(sessionTable).set({ expiresAt: session.expiresAt }),
		);

		if (!updateWatcher.success) {
			return updateWatcher;
		}
	}
	return srOk({ session, user });
}

export async function invalidateSession(sessionId: string): AsyncResultEmpty {
	const deleteWatcher = await SafeResultWrapper.direct(
		db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
	);

	if (!deleteWatcher.success) {
		return deleteWatcher;
	}

	return srOkEmpty();
}

export const getCurrentSession = cache(
	async (): AsyncResult<SessionValidationResult> => {
		const cks = await cookies();
		const token = cks.get("session")?.value ?? null;
		if (token === null) {
			return srOk({ session: null, user: null });
		}

		const result = await validateSessionToken(token);
		if (!result.success) {
			return srOk({ session: null, user: null });
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
): AsyncResultEmpty {
	const updateWatcher = await SafeResultWrapper.direct(
		db
			.update(sessionTable)
			.set({ twoFactorVerified: true })
			.where(eq(sessionTable.id, sessionId)),
	);

	if (!updateWatcher.success) {
		return updateWatcher;
	}

	return srOkEmpty();
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type SessionFlags = {
	twoFactorVerified: boolean;
};
