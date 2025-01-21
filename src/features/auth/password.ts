import "server-only";

import { SafeResultWrapper } from "@/lib/safe-result";
import { hash, verify } from "@node-rs/argon2";
import { sha1 } from "@oslojs/crypto/sha1";
import { encodeHexLowerCase } from "@oslojs/encoding";

export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});
}

export async function verifyPasswordHash(
	hash: string,
	password: string,
): Promise<boolean> {
	return await verify(hash, password);
}

export async function verifyPasswordStrength(
	password: string,
): Promise<boolean> {
	if (password.length < 8 || password.length > 255) {
		return false;
	}
	const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
	const hashPrefix = hash.slice(0, 5);

	const responseSafeResult = await SafeResultWrapper.direct(
		fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`),
	);

	if (!responseSafeResult.success) {
		return false;
	}

	const response = responseSafeResult.value;
	const data = await response.text();
	const items = data.split("\n");
	for (const hashSuffix of hashForEach(items)) {
		if (hash === hashPrefix + hashSuffix) {
			return false;
		}
	}
	return true;
}

function* hashForEach(items: string[]): Generator<string> {
	for (const item of items) {
		yield item.slice(0, 35).toLowerCase();
	}
}
