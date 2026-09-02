import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";

export function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/onboarding" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      if (err instanceof Error && err.message === "invalid_credentials") {
        setError("Incorrect email or password.");
      } else if (err instanceof Error && err.message === "email_not_verified") {
        setError("Please verify your email before signing in — check your inbox for the verification link.");
      } else {
        setError("Something went wrong. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard eyebrow="Gemma_Edstellar" title="Welcome back" subtitle="Sign in to continue your practice.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <div className="flex justify-between text-sm text-muted">
        <Link to="/forgot-password" className="hover:text-ink">
          Forgot password?
        </Link>
        <Link to="/signup" className="hover:text-ink">
          Create an account
        </Link>
      </div>
    </AuthCard>
  );
}
