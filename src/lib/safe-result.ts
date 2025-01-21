type SafeResult<T> =
	| {
			success: true;
			value: T;
	  }
	| {
			success: false;
			error: Error;
	  };

export type AsyncResult<T> = Promise<SafeResult<T>>;
export type AsyncResultEmpty = AsyncResult<null>;

export class SafeResultWrapper<T> {
	constructor(private readonly result: SafeResult<T>) {}

	static ok<T>(value: T) {
		return new SafeResultWrapper<T>({ success: true, value });
	}

	static err<T>(error: Error) {
		return new SafeResultWrapper<T>({ success: false, error });
	}

	static async direct<T>(promise: Promise<T>): AsyncResult<T> {
		try {
			const data = await promise;
			return {
				success: true as const,
				value: data,
			};
		} catch (error: unknown) {
			let transformedError: Error;
			if (error instanceof Error) {
				transformedError = error;
			} else {
				transformedError = new Error("Unknown error occurred");
			}
			return {
				success: false,
				error: transformedError,
			};
		}
	}

	static async instance<T>(promise: Promise<T>) {
		const result = await SafeResultWrapper.direct(promise);
		return new SafeResultWrapper(result);
	}

	/**
	 * Applies a function to the value inside a Result instance.
	 * @param fn Function to apply.
	 * @returns A new Result instance.
	 */
	map<U>(fn: (value: T) => U): SafeResultWrapper<U> {
		if (this.result.success) {
			return SafeResultWrapper.ok<U>(fn(this.result.value));
		}
		return SafeResultWrapper.err<U>(this.result.error);
	}

	/**
	 * Applies a function that itself returns a Result instance to the value inside a Result instance.
	 * @param fn Function to apply.
	 * @returns A new Result instance.
	 */
	flatMap<U>(fn: (value: T) => SafeResultWrapper<U>): SafeResultWrapper<U> {
		if (this.result.success) {
			return fn(this.result.value);
		}
		return SafeResultWrapper.err<U>(this.result.error);
	}

	/**
	 * Returns the value if it’s a success, or throws an error if it’s a failure.
	 * @returns The value, or throws an error.
	 */
	unwrap(): T {
		if (this.result.success) {
			return this.result.value;
		}
		throw new Error(
			`Called unwrap on an error result: ${(this.result.error as Error).message}`,
		);
	}

	/**
	 * Returns the value if it’s a success, or a default value if it’s a failure.
	 * @param defaultValue The default value if it is a failure.
	 * @returns Value or the default value if it’s a failure.
	 */
	unwrapOr(defaultValue: T): T {
		return this.result.success ? this.result.value : defaultValue;
	}

	/**
	 * Returns the value if it’s a success, or the result of a function that takes the error as an argument if it’s a failure.
	 * @param fn Error handling function.
	 * @returns Value or result of a function that takes the error as an argument.
	 */
	unwrapOrElse(fn: (error: Error) => T): T {
		return this.result.success ? this.result.value : fn(this.result.error);
	}

	get() {
		return this.result;
	}

	/**
	 *
	 */
	first() {
		if (!this.result.success) {
			return this;
		}

		const value = this.result.value;
		if (!Array.isArray(value) || value.length < 1) {
			return this;
		}

		return SafeResultWrapper.ok(value[0]);
	}
}

export function srOkEmpty(): SafeResult<null> {
	return {
		success: true,
		value: null,
	};
}

export function srOk<T>(value: T): SafeResult<T> {
	return {
		success: true,
		value,
	};
}

export function srResultErr<T>(error: Error): SafeResult<T> {
	return {
		success: false,
		error,
	};
}
