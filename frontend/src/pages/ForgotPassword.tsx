import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ROUTES } from "@/constants/routes";

export function ForgotPassword() {
  const { t } = useTranslation();
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
      eyebrow={t("common.appName")}
      title={t("auth.forgotPassword.title")}
      subtitle={t("auth.forgotPassword.subtitle")}
    >
      {submitted ? (
        <p className="text-sm text-ink text-center">{t("auth.forgotPassword.submitted")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="email"
            label={t("auth.forgotPassword.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            autoComplete="email"
            required
          />
          <Button type="submit" className="mt-1 w-full" disabled={submitting}>
            {submitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-muted">
        <Link to={ROUTES.LOGIN} className="hover:text-ink">
          {t("auth.forgotPassword.backToSignIn")}
        </Link>
      </p>
      <LanguageSwitcher />
    </AuthCard>
  );
}
