import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarCheck,
  ListChecks,
  Clock,
  Flame,
  Map,
  Check,
  Headphones,
  Mic,
  BookOpen,
  PenLine,
  ClipboardCheck,
  ArrowRight,
  Trophy,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/Button";
import { MotivationalBar } from "@/components/MotivationalBar";
import { Mascot } from "@/components/Mascot";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import {
  getDashboard,
  type DashboardData,
  type DashboardModule,
  type ModuleStatus,
  type TodaysTask,
  type InProgressPractice,
  type DashboardStats,
} from "@/api/dashboard";
import { ApiError } from "@/lib/api";
import { SKILL_TINT_CLASSES, SKILL_RING_COLOR } from "@/lib/skillTints";
import type { SkillTag } from "@/api/testSession";

const SKILL_ICONS: Record<SkillTag, typeof Headphones> = {
  listening: Headphones,
  speaking: Mic,
  reading: BookOpen,
  writing: PenLine,
};

const MODULE_STATUS_KEY: Record<ModuleStatus, string> = {
  not_started: "dashboardHome.statusNotStarted",
  in_progress: "dashboardHome.statusInProgress",
  completed: "dashboardHome.statusCompleted",
};

function StatTile({ icon: Icon, label, value, tint }: { icon: typeof Headphones; label: string; value: string; tint: string }) {
  return (
    <div className="bg-surface border border-rule rounded-card p-4 flex items-center gap-3">
      <span className={`h-10 w-10 rounded-input flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-display font-bold text-xl text-ink leading-tight">{value}</span>
        <span className="text-xs text-muted truncate">{label}</span>
      </div>
    </div>
  );
}

// One bordered list of rows, not four separate cards — distinct from Roadmap's ring-chart breakdown.
function SkillProgressList({ modules }: { modules: DashboardModule[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-rule rounded-card overflow-hidden">
      {modules.map((m, i) => {
        const Icon = SKILL_ICONS[m.skill];
        return (
          <button
            key={m.skill}
            onClick={() => navigate(`${ROUTES.MODULES}?skill=${m.skill}`)}
            className={`w-full flex items-center gap-3.5 px-5 py-4 text-left cursor-pointer hover:bg-paper-warm transition-colors ${
              i > 0 ? "border-t border-rule" : ""
            }`}
          >
            <ProgressRing percent={m.progressPercent} size={44} strokeWidth={4} colorClass={SKILL_RING_COLOR[m.skill]}>
              <Icon size={20} strokeWidth={1.8} className={SKILL_RING_COLOR[m.skill]} />
            </ProgressRing>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-ink">{t(`skills.${m.skill}`)}</span>
              <div className="text-xs text-muted">{t(MODULE_STATUS_KEY[m.status])}</div>
            </div>
            <span className={`text-sm font-bold shrink-0 ${SKILL_RING_COLOR[m.skill]}`}>{m.progressPercent}%</span>
          </button>
        );
      })}
    </div>
  );
}

// Daily habit checklist (practiced today?), distinct from Roadmap's all-time "Recommended Practice".
function TodaysTasksList({ tasks }: { tasks: TodaysTask[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-rule rounded-card overflow-hidden">
      {tasks.map((task, i) => {
        const Icon = SKILL_ICONS[task.skill];
        return (
          <div key={task.skill} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? "border-t border-rule" : ""}`}>
            <span
              className={`h-9 w-9 rounded-input flex items-center justify-center shrink-0 ${
                task.done ? "bg-success/15 text-success" : SKILL_TINT_CLASSES[task.skill]
              }`}
            >
              {task.done ? <Check size={20} strokeWidth={2.2} /> : <Icon size={20} strokeWidth={1.8} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold truncate ${task.done ? "text-muted line-through" : "text-ink"}`}>
                {t(`skills.${task.skill}`)}
              </div>
              <div className="text-xs text-muted truncate">
                {t("dashboardHome.taskProgress", { done: Math.min(task.itemsCompletedToday, task.itemTarget), target: task.itemTarget })}
              </div>
            </div>
            {!task.done && (
              <Button
                variant="secondary"
                onClick={() => navigate(`${ROUTES.MODULES}?skill=${task.skill}&count=${Math.max(1, task.itemTarget - task.itemsCompletedToday)}`)}
                className="shrink-0"
              >
                <span className="flex items-center gap-1.5">
                  {t("dashboardHome.practiceAction")}
                  <ArrowRight size={16} strokeWidth={2.2} className="nudge-arrow" />
                </span>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Surfaces an unfinished practice session so the learner doesn't have to remember which skill they left off on.
function ContinuePracticeCard({ practice }: { practice: InProgressPractice }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = SKILL_ICONS[practice.skill];

  return (
    <button
      onClick={() => navigate(`${ROUTES.MODULES}?skill=${practice.skill}`)}
      className="w-full flex items-center gap-4 bg-surface border border-accent/30 rounded-card px-5 py-4 text-left cursor-pointer hover:border-accent/60 transition-colors"
    >
      <span className={`h-11 w-11 rounded-input flex items-center justify-center shrink-0 ${SKILL_TINT_CLASSES[practice.skill]}`}>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-ink">{t("dashboardHome.continuePracticeTitle")}</div>
        <div className="text-xs text-muted">
          {t("dashboardHome.continuePracticeBody", { skill: t(`skills.${practice.skill}`), answered: practice.answered, total: practice.total })}
        </div>
      </div>
      <ArrowRight size={20} strokeWidth={1.8} className="text-accent shrink-0" />
    </button>
  );
}

// Badges derived from existing stats (no extra query) — dimmed/locked state still looks intentional on day one.
function AchievementBadges({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation();
  const badges = [
    {
      key: "firstSession",
      Icon: Trophy,
      unlocked: stats.sessions >= 1,
      title: t("dashboardHome.badgeFirstSession"),
      hint: t("dashboardHome.badgeFirstSessionHint"),
    },
    {
      key: "tenQuestions",
      Icon: ListChecks,
      unlocked: stats.questionsCompleted >= 10,
      title: t("dashboardHome.badgeTenQuestions"),
      hint: t("dashboardHome.badgeTenQuestionsHint"),
    },
    {
      key: "streak",
      Icon: Flame,
      unlocked: stats.streakDays >= 3,
      title: t("dashboardHome.badgeStreak"),
      hint: t("dashboardHome.badgeStreakHint"),
    },
    {
      key: "sharp",
      Icon: Zap,
      unlocked: stats.accuracyPercent !== null && stats.accuracyPercent >= 80,
      title: t("dashboardHome.badgeSharp"),
      hint: t("dashboardHome.badgeSharpHint"),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {badges.map((b) => (
        <div
          key={b.key}
          className={`flex flex-col items-center text-center gap-2 rounded-card border p-4 ${
            b.unlocked ? "bg-success/10 border-success/30" : "bg-surface border-rule"
          }`}
        >
          <span
            className={`h-11 w-11 rounded-full flex items-center justify-center ${
              b.unlocked ? "bg-success/20 text-success" : "bg-paper-warm text-muted"
            }`}
          >
            <b.Icon size={22} strokeWidth={1.8} />
          </span>
          <div className={`text-xs font-bold ${b.unlocked ? "text-ink" : "text-muted"}`}>{b.title}</div>
          {!b.unlocked && <div className="text-[11px] text-muted leading-snug">{b.hint}</div>}
        </div>
      ))}
    </div>
  );
}

function LearnerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [notReady, setNotReady] = useState<{ scheduledFor: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.message === "no_placement_yet") {
          const body = err.body as { assessmentScheduledFor?: string | null };
          setNotReady({ scheduledFor: body.assessmentScheduledFor ?? null });
        } else {
          setError(t("roadmap.loadError"));
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <p className="text-sm text-muted">{t("roadmap.loading")}</p>;
  if (error) return <p className="text-sm text-error">{error}</p>;

  if (notReady || !data) {
    return (
      <div className="flex flex-col items-center text-center gap-4 bg-surface border border-rule rounded-card p-10 max-w-lg mx-auto mt-10">
        <span className="h-14 w-14 rounded-full bg-paper-warm border-2 border-navy flex items-center justify-center">
          <ClipboardCheck size={32} strokeWidth={1.8} className="text-navy" />
        </span>
        <h2 className="font-display font-bold text-xl text-ink">{t("roadmap.notReadyTitle")}</h2>
        <p className="text-sm text-muted max-w-sm">
          {notReady?.scheduledFor
            ? t("roadmap.notReadyBodyScheduled", { date: new Date(notReady.scheduledFor).toLocaleDateString() })
            : t("roadmap.notReadyBody")}
        </p>
        <Button onClick={() => navigate(ROUTES.PLACEMENT)}>{t("roadmap.takeTestNow")}</Button>
      </div>
    );
  }

  const { firstName, startSkill, modules, todaysTasks, stats, inProgressPractice } = data;
  const remainingToday = todaysTasks.filter((task) => !task.done).length;
  const heroSubtitleKey =
    stats.sessions === 0
      ? "dashboardHome.subtitleFirstTime"
      : remainingToday === 0
        ? "dashboardHome.subtitleAllDoneToday"
        : "dashboardHome.subtitleContinue";
  const showStartNudge = stats.sessions === 0 || remainingToday > 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-card p-5 relative overflow-hidden bg-gradient-to-r from-navy-soft/20 via-paper-warm to-paper border border-rule">
        <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 mascot-breathe opacity-90">
          <Mascot variant="hero" size={80} />
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-bold text-xl text-ink">{t("dashboardHome.welcomeBack", { name: firstName ?? "" })}</h2>
          <p className="text-sm text-muted mt-0.5">{t(heroSubtitleKey, { count: remainingToday })}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 relative z-10 sm:mr-20">
          <Button variant="secondary" onClick={() => navigate(ROUTES.ROADMAP)}>
            <span className="flex items-center gap-1.5">
              <Map size={18} strokeWidth={1.8} /> {t("dashboardHome.viewRoadmap")}
            </span>
          </Button>
          <Button onClick={() => navigate(`${ROUTES.MODULES}?skill=${startSkill}`)}>
            <span className="flex items-center gap-1.5">
              {t("dashboardHome.startPractice")}
              {showStartNudge && <ArrowRight size={18} strokeWidth={2.2} className="nudge-arrow" />}
            </span>
          </Button>
        </div>
      </div>

      {inProgressPractice && <ContinuePracticeCard practice={inProgressPractice} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={CalendarCheck} label={t("dashboardHome.statsSessions")} value={String(stats.sessions)} tint="bg-listening/15 text-listening" />
        <StatTile icon={ListChecks} label={t("dashboardHome.statsQuestions")} value={String(stats.questionsCompleted)} tint="bg-writing/15 text-writing" />
        <StatTile icon={Clock} label={t("dashboardHome.statsTime")} value={t("dashboardHome.statsTimeValue", { minutes: stats.practiceMinutes })} tint="bg-warning/20 text-navy-deep" />
        <StatTile icon={Flame} label={t("dashboardHome.statsStreak")} value={t("dashboardHome.statsStreakValue", { count: stats.streakDays })} tint="bg-error/12 text-error" />
      </div>

      <MotivationalBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-[11px] font-medium tracking-[.24em] uppercase text-muted">{t("dashboardHome.overallProgressTitle")}</h3>
          <SkillProgressList modules={modules} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-mono text-[11px] font-medium tracking-[.24em] uppercase text-muted">
            {t(remainingToday === 0 ? "dashboardHome.todaysTasksAllDone" : "dashboardHome.todaysTasksTitleGo")}
          </h3>
          <TodaysTasksList tasks={todaysTasks} />
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-[11px] font-medium tracking-[.24em] uppercase text-muted">{t("dashboardHome.achievementsTitle")}</h3>
        <AchievementBadges stats={stats} />
      </section>
    </div>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user?.role === "learner") {
    return <LearnerDashboard />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-rule rounded-card p-6 flex flex-col gap-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">{t("dashboard.welcome", { email: user?.email })}</h1>
        <p className="text-sm text-muted mt-1">{t("dashboard.role", { role: user?.role })}</p>
      </div>
      <p className="text-sm text-muted">{t("dashboard.placeholder")}</p>
    </div>
  );
}
