import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Sun, Moon, User, LogOut } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function useTitleKey(pathname: string): string {
  if (pathname === ROUTES.ROADMAP) return "nav.roadmap";
  if (pathname === ROUTES.DASHBOARD) return "nav.overview";
  if (pathname.startsWith(ROUTES.MODULES)) return "nav.modules";
  if (pathname.startsWith(ROUTES.PRACTICE_TESTS)) return "nav.practiceTests";
  if (pathname === ROUTES.TUTOR) return "nav.tutor";
  if (pathname === ROUTES.PROFILE) return "nav.profile";
  return "common.appName";
}

function initials(email: string | undefined) {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full bg-navy text-lime flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer"
        title={user?.email}
      >
        {initials(user?.email)}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-rule rounded-input shadow-md py-1.5 z-50">
          <p className="px-3.5 py-1.5 text-xs text-muted truncate border-b border-rule mb-1">{user?.email}</p>
          <button
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.PROFILE);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink hover:bg-paper-warm transition-colors cursor-pointer"
          >
            <User size={20} strokeWidth={1.8} />
            {t("nav.profile")}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-error hover:bg-paper-warm transition-colors cursor-pointer"
          >
            <LogOut size={20} strokeWidth={1.8} />
            {t("onboarding.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const titleKey = useTitleKey(location.pathname);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-rule bg-surface px-4 sm:px-6 py-3.5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label={t("shell.openMenu")}
          className="lg:hidden -ml-1 p-1.5 rounded-input text-muted hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer shrink-0"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-display font-bold text-lg text-ink truncate">{t(titleKey)}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          aria-label={t("shell.toggleTheme")}
          className="p-1.5 rounded-input text-muted hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
