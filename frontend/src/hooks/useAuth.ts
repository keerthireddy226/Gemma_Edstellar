import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Role = "learner" | "org_admin" | "admin" | "super_admin";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  tenantId?: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "unknown_error" }));
    throw new Error(body.error ?? "request_failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    try {
      const user = await api<AuthUser>("/auth/me");
      setState({ user, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api<AuthUser>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setState({ user, loading: false, error: null });
  }, []);

  // Deliberately doesn't set auth state — signup ends with "check your email,"
  // not an automatic login (the backend doesn't create a session either).
  const signup = useCallback(async (email: string, password: string, firstName?: string) => {
    await api<{ email: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName }),
    });
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setState({ user: null, loading: false, error: null });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await api("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
    await refresh();
  }, [refresh]);

  return { ...state, login, signup, logout, forgotPassword, resetPassword, verifyEmail, refresh };
}

export const AuthContext = createContext<ReturnType<typeof useAuthState> | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider");
  return ctx;
}
