import type { Role } from "@/hooks/useAuth";

export const ROUTES = {
  LOGIN: "/learner/login",
  ORG_ADMIN_LOGIN: "/orgadmin/login",
  // Shared portal for both admin and super_admin — see ADMIN_LOGIN_ALLOWED_ROLES.
  ADMIN_LOGIN: "/admin/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
} as const;

// Which role(s) each login portal accepts.
export const LEARNER_LOGIN_ALLOWED_ROLES: Role[] = ["learner"];
export const ORG_ADMIN_LOGIN_ALLOWED_ROLES: Role[] = ["org_admin"];
export const ADMIN_LOGIN_ALLOWED_ROLES: Role[] = ["admin", "super_admin"];

// So a flow that only learns the account's role after the fact (verify-email,
// reset-password) can send the learner back to *their* role's login page,
// instead of always assuming learner.
export const LOGIN_ROUTE_BY_ROLE: Record<Role, string> = {
  learner: ROUTES.LOGIN,
  org_admin: ROUTES.ORG_ADMIN_LOGIN,
  admin: ROUTES.ADMIN_LOGIN,
  super_admin: ROUTES.ADMIN_LOGIN,
};
