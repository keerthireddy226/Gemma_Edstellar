import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <AuthCard
      eyebrow="Gemma_Edstellar"
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
    >
      {submitted ? (
        <p className="text-sm text-ink text-center">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
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
          <Button type="submit" className="mt-1 w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-muted">
        <Link to="/login" className="hover:text-ink">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
