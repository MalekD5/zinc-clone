import type { InferSelectModel } from "drizzle-orm";
import { serial, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
	id: serial("id").primaryKey(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
