import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty } from "./lib/seed";

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") return;
  const problems: string[] = [];
  if (!process.env.SESSION_SECRET) problems.push("SESSION_SECRET is required in production");
  if (!process.env.ADMIN_PASS) problems.push("ADMIN_PASS is required in production");
  if (!process.env.ADMIN_USER) problems.push("ADMIN_USER is required in production");
  if (problems.length) {
    for (const p of problems) logger.error(p);
    throw new Error("Refusing to start: insecure default credentials in production");
  }
}

async function start(): Promise<void> {
  assertProductionSecrets();
  try {
    await seedIfEmpty();
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start();
