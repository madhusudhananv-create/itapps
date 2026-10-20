// Only surface the backend's own message for 4xx (validation/conflict) responses -
// those are written for the user. A 5xx body can be a raw exception/stack trace,
// so it always falls back to the generic message instead of leaking internals.
export function errorText(err: any, fallback: string): string {
  if (!(err?.status >= 400 && err?.status < 500)) return fallback;
  return typeof err?.error === 'string' && err.error ? err.error : err?.error?.Message || fallback;
}
