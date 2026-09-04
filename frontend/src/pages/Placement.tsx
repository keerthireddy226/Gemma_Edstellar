import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Placement() {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <div className="app-surface min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-surface border border-rule rounded-card p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h1 className="font-display font-bold text-2xl text-ink">{t("placement.title")}</h1>
          <Button variant="secondary" onClick={() => logout()}>
            {t("onboarding.logout")}
          </Button>
        </div>
        <p className="text-sm text-muted">{t("placement.placeholder")}</p>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
