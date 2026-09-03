import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, type Role } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AuthCard } from "@/components/AuthCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LOGIN_ROUTE_BY_ROLE } from "@/constants/routes";

export function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then((result) => {
        setRole(result.role);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token, verifyEmail]);

  return (
    <AuthCard eyebrow={t("common.appName")} title={t("auth.verifyEmail.title")} subtitle="">
      {status === "pending" && <p className="text-center text-sm text-muted">{t("auth.verifyEmail.pending")}</p>}
      {status === "success" && role && (
        <>
          <p className="text-sm text-ink text-center">{t("auth.verifyEmail.success")}</p>
          <Button className="mt-1 w-full" onClick={() => navigate(LOGIN_ROUTE_BY_ROLE[role])}>
            {t("auth.verifyEmail.signInButton")}
          </Button>
        </>
      )}
      {status === "error" && <p className="text-center text-sm text-error">{t("auth.verifyEmail.error")}</p>}
      <LanguageSwitcher />
    </AuthCard>
  );
}
