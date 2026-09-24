import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { pool } from "./db.js";
import { authRouter } from "./auth/routes.js";
import { onboardingRouter } from "./onboarding/routes.js";
import { placementRouter } from "./placement/routes.js";
import { roadmapRouter } from "./roadmap/routes.js";
import { dashboardRouter } from "./dashboard/routes.js";
import { practiceRouter } from "./practice/routes.js";
import { voiceRouter } from "./voice/routes.js";
import { coachRouter } from "./coach/routes.js";
import { requireAuth } from "./auth/middleware.js";

// An unset FRONTEND_URL would make cors() below fall back to reflecting any
// origin (its documented behavior for a falsy `origin`) — failing loudly
// here beats silently opening credentialed CORS to every site.
if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL must be set");
}

const app = express();

app.use(helmet());
// Restricted to the actual frontend origin, not reflected for any caller —
// origin:true + credentials:true would let any site make credentialed requests.
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// Raised from the 100kb default — placement attempts can carry a base64
// audio recording (a mic response is only a few seconds long, but base64
// adds ~33% overhead on top of that).
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
// Voice enrollment samples and attempt recordings live here — requiring a
// real session (not just an unguessable filename) before serving any of it.
app.use("/uploads", requireAuth, express.static("uploads"));

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/placement", placementRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/practice", practiceRouter);
app.use("/api/voice", voiceRouter);
app.use("/api/coach", coachRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation_error", issues: err.issues });
  }
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Spica backend listening on :${port}`);
});
