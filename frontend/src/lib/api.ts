// Thrown on any non-ok response. `.message` is `body.error` (a stable code
// like "no_placement_yet") for existing message-based checks; `.body` carries
// the full JSON body when a caller needs more than the error code.
export class ApiError extends Error {
  body: unknown;
  constructor(message: string, body: unknown) {
    super(message);
    this.body = body;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown_error" }));
    throw new ApiError(body.error ?? "request_failed", body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
