import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Role = "learner" | "org_admin" | "admin" | "super_admin";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

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

  // `allowedRoles` names which role(s) the login portal accepts (e.g.
  // /admin/login accepts both admin and super_admin) — the backend rejects
  // the login if the account's actual role isn't in that list, so this is a
  // real access boundary, not just a different-looking page. Returns the
  // logged-in user so the caller can redirect based on their actual role
  // immediately, without waiting on a state update to propagate.
  const login = useCallback(async (email: string, password: string, allowedRoles: Role[]) => {
    const user = await api<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, allowedRoles }),
    });
    setState({ user, loading: false, error: null });
    return user;
  }, []);

  // Deliberately doesn't set auth state — signup ends with "check your email,"
  // not an automatic login (the backend doesn't create a session either).
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    await api<{ email: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setState({ user: null, loading: false, error: null });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  }, []);

  // Returns the account's role so the caller can redirect to *that* role's
  // login page — neither of these actions creates a session, so this is the
  // only way the frontend learns which portal the account belongs to.
  const resetPassword = useCallback(async (token: string, password: string) => {
    return api<{ role: Role }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    return api<{ role: Role }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
  }, []);

  return { ...state, login, signup, logout, forgotPassword, resetPassword, verifyEmail, refresh };
}

export const AuthContext = createContext<ReturnType<typeof useAuthState> | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider");
  return ctx;
}
