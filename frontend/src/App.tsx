import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, useAuth, useAuthState } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  ADMIN_LOGIN_ALLOWED_ROLES,
  LANDING_ROUTE_BY_ROLE,
  LEARNER_LOGIN_ALLOWED_ROLES,
  ORG_ADMIN_LOGIN_ALLOWED_ROLES,
  ROUTES,
} from "@/constants/routes";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { VerifyEmail } from "@/pages/VerifyEmail";
import { Onboarding } from "@/pages/Onboarding";
import { Placement } from "@/pages/Placement";
import { Dashboard } from "@/pages/Dashboard";

// Any unmatched path (or a stale bookmark) sends a logged-in visitor to
// *their* actual landing page, not always the learner one, and sends a
// logged-out visitor to the learner login as a reasonable default.
function DefaultRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Navigate to={LANDING_ROUTE_BY_ROLE[user.role]} replace />;
}

function App() {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login allowedRoles={LEARNER_LOGIN_ALLOWED_ROLES} />} />
        <Route
          path={ROUTES.ORG_ADMIN_LOGIN}
          element={<Login allowedRoles={ORG_ADMIN_LOGIN_ALLOWED_ROLES} />}
        />
        <Route path={ROUTES.ADMIN_LOGIN} element={<Login allowedRoles={ADMIN_LOGIN_ALLOWED_ROLES} />} />
        <Route path="/superadmin/login" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
        <Route path="/login" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route
          path={ROUTES.ONBOARDING}
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PLACEMENT}
          element={
            <ProtectedRoute>
              <Placement />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
