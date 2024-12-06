import type { InferSelectModel } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const userTable = pgTable("user", {
	id: text("id").default(nanoid(12)).primaryKey(),
	email: text("email").notNull(),
	displayName: text("display_name").notNull(),
	hashedPassword: text("hashed_password").notNull(),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "date",
	}).defaultNow(),
	totpKey: text("totp_key"),
	verified: boolean("verified_email").default(false),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	twoFactorVerified: boolean("two_factor_verified").default(false),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const recoveryCodeTable = pgTable("recovery_code", {
	code: text("code").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
});

const passwordResetSessionTable = pgTable("password_reset_session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	email: text("email").notNull(),
	code: text("code").notNull(),
	emailVerified: boolean("email_verified").default(false),
	twoFactorVerified: boolean("two_factor_verified").default(false),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type PasswordResetSession = InferSelectModel<
	typeof passwordResetSessionTable
>;
export type RecoveryCode = InferSelectModel<typeof recoveryCodeTable>;
