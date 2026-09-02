import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "@/components/AuthCard";

export function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, verifyEmail]);

  return (
    <AuthCard eyebrow="Gemma_Edstellar" title="Email verification" subtitle="">
      {status === "pending" && <p className="text-center text-sm text-muted">Verifying…</p>}
      {status === "success" && (
        <p className="text-center text-sm text-ink">
          Your email is verified.{" "}
          <Link to="/onboarding" className="font-medium hover:underline">
            Continue
          </Link>
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-error">This verification link is invalid or has expired.</p>
      )}
    </AuthCard>
  );
}
