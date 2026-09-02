import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { pool } from "./db.js";
import { authRouter } from "./auth/routes.js";

const app = express();

app.use(helmet());
// Restricted to the actual frontend origin, not reflected for any caller —
// origin:true + credentials:true would let any site make credentialed requests.
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation_error", issues: err.issues });
  }
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Gemma_Edstellar backend listening on :${port}`);
});
