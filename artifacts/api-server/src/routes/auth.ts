import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "dolmix2026";

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
  req.session.isAdmin = true;
  req.session.username = username;
  res.json({ ok: true, username });
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
