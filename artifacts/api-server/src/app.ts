import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";
import { randomBytes } from "crypto";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const isProd = process.env.NODE_ENV === "production";

const allowedOrigins: Set<string> = new Set();
for (const d of (process.env.REPLIT_DOMAINS || "").split(",").map((s) => s.trim()).filter(Boolean)) {
  allowedOrigins.add(`https://${d}`);
  allowedOrigins.add(`http://${d}`);
}
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server, curl, same-origin
      if (!isProd) return cb(null, true); // permissive in dev
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed"));
    },
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProd) {
    throw new Error("SESSION_SECRET is required in production");
  }
  sessionSecret = randomBytes(32).toString("hex");
  logger.warn("SESSION_SECRET not set — generated ephemeral dev secret. Sessions will reset on restart.");
}

let store: session.Store;
try {
  const PgStore = connectPgSimple(session);
  store = new PgStore({
    pool,
    tableName: "user_sessions",
    // Session table is created by ensureSchema() at boot; we don't rely on
    // connect-pg-simple's auto-create path because it tries to readFile a
    // table.sql that isn't in the esbuild bundle (ENOENT in production).
    createTableIfMissing: false,
    pruneSessionInterval: 60 * 60, // every hour
  });
  logger.info("Session store: connect-pg-simple");
} catch (err) {
  // In production we must never silently fall back to an in-memory store —
  // it loses sessions on restart and breaks horizontally-scaled deployments.
  // Refuse to boot so the deploy fails visibly instead of degrading to an
  // insecure / unstable mode.
  if (isProd) {
    logger.error({ err }, "Failed to init pg session store");
    throw new Error("Refusing to start in production without a persistent session store");
  }
  logger.warn({ err }, "Failed to init pg session store — falling back to memory store (dev only)");
  const MemoryStore = createMemoryStore(session);
  store = new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 });
}

app.set("trust proxy", 1);
app.use(
  session({
    name: "dolmix.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
