import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard, FormField } from "@/components/AuthCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ROUTES } from "@/constants/routes";

export function ResetPassword() {
  const { t } = useTranslation();
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
      setError(t("auth.resetPassword.passwordTooShort"));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      setError(t("auth.resetPassword.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        eyebrow={t("common.appName")}
        title={t("auth.resetPassword.missingTokenTitle")}
        subtitle={t("auth.resetPassword.missingTokenSubtitle")}
      >
        <p className="text-center text-sm text-muted">
          <Link to={ROUTES.FORGOT_PASSWORD} className="hover:text-ink">
            {t("auth.resetPassword.requestNewLink")}
          </Link>
        </p>
        <LanguageSwitcher />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow={t("common.appName")}
      title={t("auth.resetPassword.title")}
      subtitle={t("auth.resetPassword.subtitle")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="password"
          label={t("auth.resetPassword.passwordLabel")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.resetPassword.passwordPlaceholder")}
          autoComplete="new-password"
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
        </Button>
      </form>
      <LanguageSwitcher />
    </AuthCard>
  );
}
