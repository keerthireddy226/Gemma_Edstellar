import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaceEnrollmentConsent } from "@/components/FaceEnrollmentConsent";
import { FaceCheck } from "@/components/FaceCheck";
import { ROUTES } from "@/constants/routes";

// Consent -> capture. Never traps anyone here — declining or failing still
// navigates on, same as voice enrollment did.
export function FaceEnrollment() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = (location.state as { next?: string } | null)?.next ?? ROUTES.PLACEMENT_TEST;
  const [consented, setConsented] = useState(false);

  return (
    <div className="app-surface min-h-screen overflow-y-auto flex items-center justify-center px-4 py-10">
      {!consented ? (
        <FaceEnrollmentConsent onAccept={() => setConsented(true)} onDecline={() => navigate(next, { replace: true })} />
      ) : (
        <FaceCheck mode="enroll" onComplete={() => navigate(next, { replace: true })} />
      )}
    </div>
  );
}
