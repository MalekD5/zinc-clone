type ResultFailure = { ok: false };

type ResultFailureError = ResultFailure & { error: Error };

type ResultNoData = { ok: true } | ResultFailureError;

type Result<T> = { ok: true; data: T } | ResultFailureError;
