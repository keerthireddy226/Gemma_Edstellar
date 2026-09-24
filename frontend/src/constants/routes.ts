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
  PLACEMENT: "/placement",
  PLACEMENT_TEST: "/placement/test",
  VOICE_ENROLLMENT: "/voice-enrollment",
  ROADMAP: "/roadmap",
  DASHBOARD: "/dashboard",
  PROGRESS: "/progress",
  MODULES: "/modules",
  PRACTICE_TESTS: "/practice-tests",
  TUTOR: "/tutor",
  PROFILE: "/profile",
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

// Where each role lands after logging in. Only learner has a real destination
// (the onboarding questionnaire) — Org Admin/Admin/Super Admin consoles are
// reserved/Phase 2, not built yet, so they land on the existing generic
// Dashboard placeholder instead of the learner-specific onboarding flow.
export const LANDING_ROUTE_BY_ROLE: Record<Role, string> = {
  learner: ROUTES.ONBOARDING,
  org_admin: ROUTES.DASHBOARD,
  admin: ROUTES.DASHBOARD,
  super_admin: ROUTES.DASHBOARD,
};
