import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  LogOut,
  GraduationCap,
  ArrowRightLeft,
  CalendarDays,
  CalendarClock,
  Pencil,
  X,
  Check,
  Mail,
  User,
  Volume2,
  Clock,
  Globe,
  Mic,
} from "lucide-react";
import { VoiceSection } from "@/components/VoiceSection";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { getVoiceEnrollmentStatus } from "@/hooks/useVoiceCheck";
import { getOnboardingProfile, updateSpokenPromptsPreference, type OnboardingProfile } from "@/hooks/useOnboarding";
import { getRoadmap, type RoadmapData } from "@/hooks/useRoadmap";
import { ROUTES } from "@/constants/routes";

// A colored icon-in-squircle badge, reused as the visual anchor for every
// card header and row in this page — same "shapes + color" treatment
// Modules got, instead of plain grey icons and mono-uppercase-only labels.
function IconBadge({ icon: Icon, tint, size = 36 }: { icon: typeof GraduationCap; tint: string; size?: number }) {
  return (
    <span
      className={`rounded-2xl flex items-center justify-center shrink-0 ${tint}`}
      style={{ height: size, width: size }}
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
    </span>
  );
}

function SectionHeader({ icon, tint, title }: { icon: typeof GraduationCap; tint: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <IconBadge icon={icon} tint={tint} size={30} />
      <h3 className="font-display font-bold text-sm text-ink">{title}</h3>
    </div>
  );
}

function PlanRow({ icon, tint, label, value }: { icon: typeof GraduationCap; tint: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <IconBadge icon={icon} tint={tint} size={32} />
      <span className="flex-1 text-sm text-ink min-w-0">{label}</span>
      <span className="text-sm font-bold text-ink text-right shrink-0">{value}</span>
    </div>
  );
}

// Everything here is already collected elsewhere (onboarding's exam-goal
// step, the placement test, the roadmap's access window) and just never
// surfaced again after those flows finished — this reads the same
// endpoints Onboarding/Roadmap already use, not new backend work.
function PlanSection() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getOnboardingProfile(), getRoadmap()]).then(([p, r]) => {
      if (p.status === "fulfilled") setProfile(p.value);
      if (r.status === "fulfilled") setRoadmap(r.value);
      setLoading(false);
    });
  }, []);

  // No onboarding profile and no roadmap (placement not taken yet) — nothing
  // real to show, so the whole card (including the loading state) doesn't
  // render at all rather than showing an empty bordered shell.
  if (!loading && !profile?.exam_preference && !roadmap) return null;
  if (loading) {
    return (
      <div className="bg-surface border border-rule rounded-card p-6">
        <p className="text-sm text-muted">{t("profile.plan.loading")}</p>
      </div>
    );
  }

  const notSet = t("profile.plan.notSet");
  const examName = profile?.exam_preference ? t(`onboarding.wizard.examGoal.exam.${profile.exam_preference}`) : notSet;
  const daysLeft = roadmap?.accessWindow
    ? Math.max(
        0,
        Math.ceil(
          (new Date(roadmap.accessWindow.startDate).getTime() +
            roadmap.accessWindow.durationDays * 86_400_000 -
            Date.now()) /
            86_400_000,
        ),
      )
    : null;

  return (
    <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-1">
      <SectionHeader icon={GraduationCap} tint="bg-accent/15 text-accent" title={t("profile.plan.title")} />
      <div className="flex flex-col divide-y divide-rule mt-3">
        <PlanRow icon={GraduationCap} tint="bg-accent/15 text-accent" label={t("profile.plan.exam")} value={examName} />
        <PlanRow
          icon={ArrowRightLeft}
          tint="bg-listening/15 text-listening"
          label={t("profile.plan.currentToGoal")}
          value={roadmap ? `${roadmap.placement.cefrLevel} → ${roadmap.goalLevel}` : notSet}
        />
        <PlanRow
          icon={CalendarDays}
          tint="bg-reading/15 text-reading"
          label={t("profile.plan.examDateLabel")}
          value={profile?.exam_date ? new Date(profile.exam_date).toLocaleDateString() : notSet}
        />
        <PlanRow
          icon={CalendarClock}
          tint="bg-speaking/15 text-speaking"
          label={t("profile.plan.accessDaysLeft")}
          value={daysLeft !== null ? String(daysLeft) : notSet}
        />
      </div>
    </div>
  );
}

function IdentityCheckSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState<boolean | null>(null);

  useEffect(() => {
    getVoiceEnrollmentStatus()
      .then((res) => setEnrolled(res.enrolled))
      .catch(() => setEnrolled(false));
  }, []);

  return (
    <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-3 h-full">
      <SectionHeader icon={ShieldCheck} tint="bg-success/15 text-success" title={t("profile.identityCheck.title")} />
      <p className="text-sm text-muted -mt-1">{t("profile.identityCheck.subtitle")}</p>
      <div className="flex items-center gap-3 rounded-card border border-rule px-4 py-3.5 mt-auto">
        <span
          className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${
            enrolled ? "bg-success/15 text-success" : "bg-paper-warm text-muted"
          }`}
        >
          <ShieldCheck size={18} strokeWidth={1.8} />
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-ink">
          {enrolled === null ? t("profile.identityCheck.loading") : enrolled ? t("profile.identityCheck.enrolled") : t("profile.identityCheck.notEnrolled")}
        </span>
        <Button variant="secondary" onClick={() => navigate(ROUTES.VOICE_ENROLLMENT, { state: { next: ROUTES.PROFILE } })}>
          {enrolled ? t("profile.identityCheck.reenroll") : t("profile.identityCheck.enroll")}
        </Button>
      </div>
    </div>
  );
}

// Real editing, not decorative — PATCH /auth/me actually updates the
// account (see updateName in useAuth.ts). Email/account type stay
// read-only: email is tied to login/verification, and every account
// reaching this (learner-only) portal has the same account type.
function PersonalInformation() {
  const { t } = useTranslation();
  const { user, updateName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEditing(true);
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      await updateName(firstName.trim(), lastName.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const accountType = user?.role === "learner" ? t("profile.account.individual") : user?.role;

  return (
    <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={User} tint="bg-navy/15 text-navy" title={t("profile.personalInfo.title")} />
        {!editing && (
          <button
            onClick={startEditing}
            aria-label={t("profile.personalInfo.edit")}
            className="h-9 w-9 rounded-full flex items-center justify-center text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer shrink-0"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">{t("profile.personalInfo.firstName")}</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">{t("profile.personalInfo.lastName")}</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button onClick={handleSave} disabled={saving || !firstName.trim() || !lastName.trim()}>
              <span className="flex items-center gap-1.5">
                <Check size={16} strokeWidth={2.2} />
                {saving ? t("profile.personalInfo.saving") : t("profile.personalInfo.save")}
              </span>
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              <span className="flex items-center gap-1.5">
                <X size={16} strokeWidth={2.2} />
                {t("profile.personalInfo.cancel")}
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <FieldDisplay icon={User} label={t("profile.personalInfo.firstName")} value={user?.firstName || "—"} />
          <FieldDisplay icon={User} label={t("profile.personalInfo.lastName")} value={user?.lastName || "—"} />
          <FieldDisplay icon={Mail} label={t("profile.personalInfo.email")} value={user?.email ?? ""} />
          <FieldDisplay icon={ShieldCheck} label={t("profile.personalInfo.accountType")} value={accountType ?? ""} />
        </div>
      )}
    </div>
  );
}

function FieldDisplay({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} strokeWidth={1.8} className="text-muted shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
        <div className="text-sm font-semibold text-ink mt-0.5 truncate">{value}</div>
      </div>
    </div>
  );
}

// Reuses the same "Coming soon" copy already used on Practice Tests' preview
// cards, rather than a new translation key for the same idea.
function ComingSoonBadge() {
  const { t } = useTranslation();
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted bg-paper-warm px-1.5 py-0.5 rounded-pill shrink-0">
      {t("practiceTests.comingSoon")}
    </span>
  );
}

function ToggleRow({
  icon,
  tint,
  title,
  subtitle,
  checked,
  disabled,
  comingSoon,
  onChange,
}: {
  icon: typeof Mail;
  tint: string;
  title: string;
  subtitle: string;
  checked: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <IconBadge icon={icon} tint={tint} size={34} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{title}</span>
          {comingSoon && <ComingSoonBadge />}
        </div>
        <p className="text-xs text-muted mt-0.5">{subtitle}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 rounded-pill shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed ${
          checked ? "bg-accent" : "bg-rule-strong"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

// Only "Spoken Audio Prompts" is real (saved via PATCH /onboarding/preferences
// and reloaded from participant_profiles.spoken_prompts_enabled). The other
// two have no backend at all — shown disabled with a "coming soon" marker
// rather than pretending to work, same honesty as the Tutor/Practice Tests
// previews.
function PreferencesSection() {
  const { t } = useTranslation();
  const [spokenPrompts, setSpokenPrompts] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getOnboardingProfile()
      .then((res) => setSpokenPrompts(res?.spoken_prompts_enabled ?? true))
      .finally(() => setLoaded(true));
  }, []);

  async function handleToggleSpokenPrompts(next: boolean) {
    setSpokenPrompts(next);
    try {
      await updateSpokenPromptsPreference(next);
    } catch {
      setSpokenPrompts(!next);
    }
  }

  return (
    <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-1">
      <SectionHeader icon={Volume2} tint="bg-writing/15 text-writing" title={t("profile.preferences.title")} />
      <div className="flex flex-col divide-y divide-rule mt-2">
        <ToggleRow
          icon={Volume2}
          tint="bg-accent/15 text-accent"
          title={t("profile.preferences.spokenPrompts.title")}
          subtitle={t("profile.preferences.spokenPrompts.subtitle")}
          checked={spokenPrompts}
          disabled={!loaded}
          onChange={handleToggleSpokenPrompts}
        />
        <ToggleRow
          icon={Mail}
          tint="bg-paper-warm text-muted"
          title={t("profile.preferences.weeklyReports.title")}
          subtitle={t("profile.preferences.weeklyReports.subtitle")}
          checked={false}
          disabled
          comingSoon
        />
        <ToggleRow
          icon={Clock}
          tint="bg-paper-warm text-muted"
          title={t("profile.preferences.strictTimer.title")}
          subtitle={t("profile.preferences.strictTimer.subtitle")}
          checked={false}
          disabled
          comingSoon
        />
      </div>
    </div>
  );
}

export function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || t("profile.account.unnamed");
  const accountType = user?.role === "learner" ? t("profile.account.individual") : user?.role;

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <div className="relative bg-surface border border-rule rounded-card overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-navy-soft/30 via-accent/20 to-writing/20" />
            <div className="flex flex-col items-center text-center gap-2 px-6 pb-6 -mt-10">
              <span className="h-20 w-20 rounded-full bg-navy text-lime flex items-center justify-center shrink-0 font-display font-bold text-2xl ring-4 ring-surface shadow-sm">
                {initials}
              </span>
              <h1 className="font-display font-bold text-lg text-ink">{fullName}</h1>
              <p className="text-sm text-muted flex items-center gap-1.5">
                <Mail size={13} strokeWidth={1.8} />
                {user?.email}
              </p>
              <span className="text-xs font-semibold text-accent bg-accent/15 px-2.5 py-1 rounded-pill">{accountType}</span>
              <button
                onClick={handleLogout}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-error transition-colors cursor-pointer"
              >
                <LogOut size={15} strokeWidth={2} />
                {t("onboarding.logout")}
              </button>
            </div>
          </div>

          <PlanSection />
        </div>

        <div className="flex flex-col gap-6">
          <PersonalInformation />
          <PreferencesSection />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-3">
          <SectionHeader icon={Mic} tint="bg-speaking/15 text-speaking" title={t("profile.voice.title")} />
          <VoiceSection hideTitle />
        </div>

        <IdentityCheckSection />
      </div>

      <div className="bg-surface border border-rule rounded-card p-6 flex flex-col gap-3">
        <SectionHeader icon={Globe} tint="bg-listening/15 text-listening" title={t("profile.language.title")} />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
