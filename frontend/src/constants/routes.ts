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
  FACE_ENROLLMENT: "/face-enrollment",
  PLACEMENT_TEST: "/placement/test",
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

// Lets verify-email/reset-password send the learner to *their* role's login page.
export const LOGIN_ROUTE_BY_ROLE: Record<Role, string> = {
  learner: ROUTES.LOGIN,
  org_admin: ROUTES.ORG_ADMIN_LOGIN,
  admin: ROUTES.ADMIN_LOGIN,
  super_admin: ROUTES.ADMIN_LOGIN,
};

// Only learner has a real destination (onboarding) — admin roles land on the Dashboard placeholder.
export const LANDING_ROUTE_BY_ROLE: Record<Role, string> = {
  learner: ROUTES.ONBOARDING,
  org_admin: ROUTES.DASHBOARD,
  admin: ROUTES.DASHBOARD,
  super_admin: ROUTES.DASHBOARD,
};
