import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Idempotent, additive schema guards that run on every boot.
 *
 * Drizzle-kit `push` is a developer-time operation; production deploys do not
 * automatically pick up new columns. To keep the public menu and admin panel
 * working safely after a deploy without requiring an out-of-band manual
 * migration step, we apply additive `ADD COLUMN IF NOT EXISTS` statements at
 * startup. These match the columns declared in `lib/db/src/schema/menu.ts`
 * and are safe to re-run.
 *
 * Only additive, no-data-loss statements belong here. Anything destructive or
 * data-shape-changing must go through a real migration.
 */
export async function ensureSchema(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS items
      ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false
  `);

  // Pre-create the express-session table used by connect-pg-simple. We do this
  // here (instead of relying on createTableIfMissing) because the bundled
  // server does not ship the connect-pg-simple `table.sql` file, so its
  // auto-create path crashes at runtime (ENOENT).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "sid"    varchar      NOT NULL COLLATE "default",
      "sess"   json         NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire")
  `);

  // One-shot idempotent fix for grape_leaves prices that were stored with
  // off-by-±10 rounding artifacts from the old multiplier-based seed. Only
  // touches rows that still have the exact bad values, so admin overrides
  // and already-correct rows are untouched. Safe to re-run on every boot.
  const fixed = await db.execute(sql`
    WITH targets AS (
      SELECT id FROM items
      WHERE category_id = (SELECT id FROM categories WHERE slug = 'grape_leaves')
    )
    UPDATE sizes SET price = CASE legacy_id
      WHEN 's_l'      THEN 8000
      WHEN 's_xxl'    THEN 23000
      WHEN 's_dolmax' THEN 5000
      WHEN 's_party'  THEN 25000
      WHEN 's_happy'  THEN 19000
      ELSE price
    END
    WHERE item_id IN (SELECT id FROM targets)
      AND (
        (legacy_id = 's_l'      AND price = 8010)  OR
        (legacy_id = 's_xxl'    AND price = 23010) OR
        (legacy_id = 's_dolmax' AND price = 5010)  OR
        (legacy_id = 's_party'  AND price = 24990) OR
        (legacy_id = 's_happy'  AND price = 18990)
      )
    RETURNING id
  `);
  const fixedCount = (fixed as unknown as { rowCount?: number }).rowCount ?? 0;
  if (fixedCount > 0) {
    logger.info({ fixedCount }, "ensureSchema: corrected legacy grape_leaves prices");
  }

  logger.info("ensureSchema: additive column guards applied");
}
