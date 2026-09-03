import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  ADMIN_LOGIN_ALLOWED_ROLES,
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
import { Dashboard } from "@/pages/Dashboard";

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
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.ONBOARDING} replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
