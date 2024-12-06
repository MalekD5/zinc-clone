export async function safePromise<T>(
	promise: Promise<T>,
): Promise<[undefined, T] | [Error]> {
	return promise
		.then((result) => [undefined, result] as [undefined, T])
		.catch((error) => [error]);
}

export async function safePromiseTyped<
	T,
	E extends new (
		message?: string,
	) => Error,
>(
	promise: Promise<T>,
	errorsToCatch?: E[],
): Promise<[undefined, T] | [InstanceType<E>]> {
	return promise
		.then((result) => [undefined, result] as [undefined, T])
		.catch((error) => {
			if (errorsToCatch?.some((errorType) => error instanceof errorType)) {
				return [error];
			}
			throw error;
		});
}
