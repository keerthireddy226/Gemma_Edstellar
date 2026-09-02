import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";

export function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch {
      setError("This reset link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard eyebrow="Gemma_Edstellar" title="Reset your password" subtitle="This link is missing its token.">
        <p className="text-center text-sm text-muted">
          <Link to="/forgot-password" className="hover:text-ink">
            Request a new reset link
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Gemma_Edstellar" title="Choose a new password" subtitle="Make it at least 8 characters.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Reset Password"}
        </Button>
      </form>
    </AuthCard>
  );
}
