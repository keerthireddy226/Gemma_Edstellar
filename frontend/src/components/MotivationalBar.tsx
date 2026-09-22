import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LINES = [
  "motivational.line1",
  "motivational.line2",
  "motivational.line3",
  "motivational.line4",
  "motivational.line5",
  "motivational.line6",
  "motivational.line7",
  "motivational.line8",
  "motivational.line9",
];

function pickNext(current: string): string {
  if (LINES.length <= 1) return LINES[0];
  let next = current;
  while (next === current) {
    next = LINES[Math.floor(Math.random() * LINES.length)];
  }
  return next;
}

export function MotivationalBar() {
  const [line, setLine] = useState(() => LINES[Math.floor(Math.random() * LINES.length)]);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => setLine((current) => pickNext(current)), 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface border border-rule rounded-card px-4 py-2.5 border-l-4 border-l-accent">
      <p className="text-sm text-muted italic">{t(line)}</p>
    </div>
  );
}
