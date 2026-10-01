// Thrown on any non-ok response. `.message` is the stable error code; `.body` carries the full JSON.
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
