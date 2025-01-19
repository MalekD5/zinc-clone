import normalizeEmail from "validator/es/lib/normalizeEmail";
import { z } from "zod";

export const userNameSchema = z
	.string()
	.min(4, "Username must be at least 4 characters long")
	.max(16, "Username must be at most 16 characters long")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Username can only contain letters, numbers, and underscores",
	)
	.trim();

const emailSchema = z
	.string()
	.email("Invalid email address")
	.trim()
	.transform((email) =>
		normalizeEmail(email, {
			all_lowercase: true,
			gmail_remove_dots: true,
			gmail_remove_subaddress: true,
			gmail_convert_googlemaildotcom: true,
			outlookdotcom_remove_subaddress: true,
			yahoo_remove_subaddress: true,
			icloud_remove_subaddress: true,
		}),
	);
