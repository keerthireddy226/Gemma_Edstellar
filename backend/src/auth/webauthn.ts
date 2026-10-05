import { URL } from "node:url";

// rpID must be a domain with no scheme/port (e.g. "localhost" or "spica.app") —
// derived from FRONTEND_URL so dev/prod don't need a separate config value.
const frontendUrl = new URL(process.env.FRONTEND_URL!);

export const RP_NAME = "Spica";
export const RP_ID = frontendUrl.hostname;
export const ORIGIN = frontendUrl.origin;

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
