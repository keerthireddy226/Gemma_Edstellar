import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard } from "@/components/AuthCard";

export function VerifyEmail() {
  const navigate = useNavigate();
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
        <>
          <p className="text-sm text-ink text-center">Your email is verified. Sign in to continue.</p>
          <Button className="mt-1 w-full" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-error">This verification link is invalid or has expired.</p>
      )}
    </AuthCard>
  );
}
