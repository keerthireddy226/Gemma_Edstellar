import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";

export function Onboarding() {
  const { user, logout } = useAuth();

  return (
    <div className="app-surface min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-surface border border-rule rounded-card p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink">Let's set up your practice</h1>
            <p className="text-sm text-muted mt-1">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            Log out
          </Button>
        </div>
        {user && !user.emailVerified && (
          <div className="rounded-input bg-warning/15 text-navy-deep text-sm px-4 py-3">
            Please verify your email — check your inbox for the verification email.
          </div>
        )}
        <p className="text-sm text-muted">
          This is a placeholder — the real onboarding questionnaire (exam choice, target CEFR level, exam date, prep
          days, daily minutes, past attempts) is built in a later phase, then leads into the placement test.
        </p>
      </div>
    </div>
  );
}
