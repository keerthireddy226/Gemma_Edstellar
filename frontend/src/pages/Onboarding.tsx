import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Onboarding() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="app-surface min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-surface border border-rule rounded-card p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink">{t("onboarding.title")}</h1>
            <p className="text-sm text-muted mt-1">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            {t("onboarding.logout")}
          </Button>
        </div>
        <p className="text-sm text-muted">{t("onboarding.placeholder")}</p>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
