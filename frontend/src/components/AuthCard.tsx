import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="app-surface min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-surface border border-rule rounded-card shadow-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="h-12 w-12 rounded-input bg-navy text-lime flex items-center justify-center">
            <GraduationCap size={24} strokeWidth={1.8} />
          </span>
          <div>
            <p className="font-mono text-xs font-medium tracking-[.18em] uppercase text-muted">{eyebrow}</p>
            <h1 className="font-display font-bold text-xl text-ink mt-1.5">{title}</h1>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormField({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded-input border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
        {...props}
      />
    </div>
  );
}
