import { api } from "@/lib/api";

export function scheduleLater(): Promise<{ scheduledUntil: string }> {
  return api("/placement/schedule-later", { method: "POST" });
}
