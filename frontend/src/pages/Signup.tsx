import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";

export function Signup() {
  const navigate = useNavigate();
  const { user, signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/onboarding" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password, firstName || undefined);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof Error && err.message === "email_already_registered"
        ? "An account with that email already exists."
        : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard eyebrow="Gemma_Edstellar" title="Create your account" subtitle="Start practicing in a few seconds.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="firstName"
          label="First name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Alex"
          autoComplete="given-name"
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign Up"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-ink font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
