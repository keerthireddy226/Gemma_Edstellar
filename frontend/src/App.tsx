import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
