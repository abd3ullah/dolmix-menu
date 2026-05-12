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
  logger.info("ensureSchema: additive column guards applied");
}
