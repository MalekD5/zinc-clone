import "server-only";

import { db } from "@/db/drizzle";
import { type Session, type User, sessionTable, userTable } from "@/db/schema";
import { safePromise } from "@/lib/error";
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
): Promise<Result<Session>> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified,
	};
	const [error] = await safePromise(db.insert(sessionTable).values(session));
	if (error) {
		return {
			ok: false,
			error,
		};
	}
	return {
		ok: true,
		data: session,
	};
}

export async function validateSessionToken(
	token: string,
): Promise<[Error] | [undefined, SessionValidationResult]> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [error, result] = await safePromise(
		db
			.select({ user: userTable, session: sessionTable })
			.from(sessionTable)
			.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
			.where(eq(sessionTable.id, sessionId)),
	);

	if (error) {
		return [error];
	}

	if (result.length < 1) {
		return [
			undefined,
			{
				session: null,
				user: null,
			},
		];
	}

	const { user, session } = result[0];

	if (Date.now() >= session.expiresAt.getTime()) {
		const [error] = await safePromise(
			db.delete(sessionTable).where(eq(sessionTable.id, session.id)),
		);
		if (error) {
			return [error];
		}
		return [undefined, { session: null, user: null }];
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		const [error] = await safePromise(
			db
				.update(sessionTable)
				.set({
					expiresAt: session.expiresAt,
				})
				.where(eq(sessionTable.id, session.id)),
		);
		if (error) {
			return [error];
		}
	}
	return [undefined, { session, user }];
}

export async function invalidateSession(
	sessionId: string,
): Promise<ResultNoData> {
	const [error] = await safePromise(
		db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
	);
	if (error) {
		return {
			ok: false,
			error,
		};
	}

	return {
		ok: true,
	};
}

export const getCurrentSession = cache(
	async (): Promise<SessionValidationResult> => {
		const cks = await cookies();
		const token = cks.get("session")?.value ?? null;
		if (token === null) {
			return { session: null, user: null };
		}
		const [error, data] = await validateSessionToken(token);
		if (error) {
			return { session: null, user: null };
		}

		return data;
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
): Promise<ResultNoData> {
	const [error] = await safePromise(
		db
			.update(sessionTable)
			.set({ twoFactorVerified: true })
			.where(eq(sessionTable.id, sessionId)),
	);

	if (error) {
		return {
			ok: false,
			error,
		};
	}

	return {
		ok: true,
	};
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type SessionFlags = {
	twoFactorVerified: boolean;
};
