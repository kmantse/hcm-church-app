import { createClient } from "@libsql/client";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !url.startsWith("libsql://")) {
  console.error("DATABASE_URL must be a libsql:// Turso URL");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  // Create Prisma's migrations tracking table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id                VARCHAR(36)  NOT NULL PRIMARY KEY,
      checksum          VARCHAR(64)  NOT NULL,
      finished_at       DATETIME,
      migration_name    VARCHAR(255) NOT NULL,
      logs              TEXT,
      rolled_back_at    DATETIME,
      started_at        DATETIME     NOT NULL DEFAULT current_timestamp,
      applied_steps_count INTEGER    NOT NULL DEFAULT 0
    )
  `);

  const migrationsDir = path.join(process.cwd(), "prisma/migrations");
  const migrationFolders = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();

  for (const folder of migrationFolders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    // Check if already applied
    const existing = await client.execute({
      sql: "SELECT id FROM _prisma_migrations WHERE migration_name = ?",
      args: [folder],
    });
    if (existing.rows.length > 0) {
      console.log(`⏭  Already applied: ${folder}`);
      continue;
    }

    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log(`▶  Applying: ${folder}`);

    // Split on semicolons; strip comment lines within each statement
    const statements = sql
      .split(";")
      .map((s) =>
        s
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim()
      )
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("already exists")) {
          console.log(`  ⚠ Skipped (already exists): ${stmt.split("\n")[0].substring(0, 60)}`);
        } else {
          throw e;
        }
      }
    }

    await client.execute({
      sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count)
            VALUES (?, ?, ?, datetime('now'), 1)`,
      args: [crypto.randomUUID(), "applied-via-script", folder],
    });

    console.log(`✓  Done: ${folder}`);
  }

  console.log("\n✅ All migrations applied to Turso successfully!");
}

main()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1); })
  .finally(() => client.close());
