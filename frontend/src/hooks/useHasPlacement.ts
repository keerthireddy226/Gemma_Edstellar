import { useEffect, useState } from "react";
import { getRoadmap } from "@/api/roadmap";

// Sidebar nav items past Roadmap/Overview stay locked until a placement
// result exists — mirrors the same signal the Roadmap page itself uses.
export function useHasPlacement() {
  const [hasPlacement, setHasPlacement] = useState<boolean | null>(null);

  useEffect(() => {
    getRoadmap()
      .then(() => setHasPlacement(true))
      .catch(() => setHasPlacement(false));
  }, []);

  return hasPlacement;
}
