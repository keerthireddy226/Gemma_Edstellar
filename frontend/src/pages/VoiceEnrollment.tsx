import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VoiceEnrollmentConsent } from "@/components/VoiceEnrollmentConsent";
import { VoiceCheck } from "@/components/VoiceCheck";
import { ROUTES } from "@/constants/routes";

// Composes consent -> record. Navigates to `next` (from router state,
// default the placement test) once done — whether enrollment succeeded,
// failed, or the learner declined consent outright. Never traps anyone
// here; this step is meant to add a layer of integrity, not a gate that
// can strand a learner from taking their test at all.
export function VoiceEnrollment() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = (location.state as { next?: string } | null)?.next ?? ROUTES.PLACEMENT_TEST;
  const [consented, setConsented] = useState(false);

  return (
    // Centered when the content fits; when it's taller than the viewport,
    // overflow-y-auto lets browsers fall back to "safe" (top-anchored,
    // scrollable) alignment instead of clipping the top of the card —
    // standard behavior for a centered, variable-height card like this.
    <div className="app-surface min-h-screen overflow-y-auto flex items-center justify-center px-4 py-10">
      {!consented ? (
        <VoiceEnrollmentConsent onAccept={() => setConsented(true)} onDecline={() => navigate(next, { replace: true })} />
      ) : (
        <VoiceCheck mode="enroll" onComplete={() => navigate(next, { replace: true })} />
      )}
    </div>
  );
}
