import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Without this, an idle client erroring out (e.g. a dropped connection) crashes
// the whole process via an unhandled 'error' event — a known node-postgres gotcha.
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client:", err);
});
