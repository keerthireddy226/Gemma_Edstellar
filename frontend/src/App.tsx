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
import { FaceEnrollment } from "@/pages/FaceEnrollment";
import { PlacementTest } from "@/pages/PlacementTest";
import { Roadmap } from "@/pages/Roadmap";
import { Dashboard } from "@/pages/Dashboard";
import { Progress } from "@/pages/Progress";
import { Modules } from "@/pages/Modules";
import { PracticeTests } from "@/pages/PracticeTests";
import { Tutor } from "@/pages/Tutor";
import { Profile } from "@/pages/Profile";
import { AdminReview } from "@/pages/AdminReview";
import { AppLayout } from "@/components/AppShell/AppLayout";

// Unmatched path: logged-in goes to their landing page, logged-out to learner login.
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
          path={ROUTES.FACE_ENROLLMENT}
          element={
            <ProtectedRoute>
              <FaceEnrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PLACEMENT_TEST}
          element={
            <ProtectedRoute>
              <PlacementTest />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ROADMAP} element={<Roadmap />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PROGRESS} element={<Progress />} />
          <Route path={ROUTES.MODULES} element={<Modules />} />
          <Route path={ROUTES.PRACTICE_TESTS} element={<PracticeTests />} />
          <Route path={ROUTES.TUTOR} element={<Tutor />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.ADMIN_REVIEW} element={<AdminReview />} />
        </Route>
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
