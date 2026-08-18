import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Add it to your .env file."
  );
}

const useSsl =
  String(process.env.DATABASE_SSL).toLowerCase() === "true";

/**
 * Creates a reusable PostgreSQL connection pool.
 *
 * The pool allows multiple database queries without opening
 * a completely new connection for every request.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: useSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

/**
 * Handles unexpected database connection errors.
 */
pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL connection error:",
    error
  );
});

/**
 * Checks whether the backend can successfully connect
 * to PostgreSQL.
 *
 * This will later be used by the /api/health route.
 */
export async function checkDatabaseConnection() {
  const result = await pool.query(`
    SELECT
      NOW() AS current_time,
      current_database() AS database_name
  `);

  return result.rows[0];
}