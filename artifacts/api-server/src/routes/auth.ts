import { Router, type IRouter } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS_RAW = process.env.ADMIN_PASS;
const isProd = process.env.NODE_ENV === "production";

let ADMIN_PASS = ADMIN_PASS_RAW;
if (!ADMIN_PASS) {
  if (isProd) {
    throw new Error("ADMIN_PASS environment variable is required in production");
  }
  ADMIN_PASS = "dolmix2026";
  logger.warn("ADMIN_PASS not set — using insecure dev default. Set ADMIN_PASS env var for any non-dev use.");
}

const LoginBody = z.object({
  username: z.string(),
  password: z.string(),
});

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const { username, password } = parsed.data;
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }
  // Regenerate session id on privilege elevation to prevent fixation.
  req.session.regenerate((err) => {
    if (err) {
      req.log.error({ err }, "session regenerate failed");
      res.status(500).json({ error: "فشل تسجيل الدخول" });
      return;
    }
    req.session.isAdmin = true;
    req.session.username = username;
    req.session.save((err2) => {
      if (err2) {
        req.log.error({ err: err2 }, "session save failed");
        res.status(500).json({ error: "فشل تسجيل الدخول" });
        return;
      }
      res.json({ ok: true, username });
    });
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("dolmix.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (req.session?.isAdmin) {
    res.json({ isAdmin: true, username: req.session.username });
    return;
  }
  res.json({ isAdmin: false });
});

export default router;
