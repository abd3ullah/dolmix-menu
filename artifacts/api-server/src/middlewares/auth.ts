import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    username?: string;
  }
}

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getAllowedHosts(req: Request): Set<string> {
  const hosts = new Set<string>();
  const reqHost = req.get("host");
  if (reqHost) hosts.add(reqHost.toLowerCase());
  for (const d of (process.env.REPLIT_DOMAINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    hosts.add(d.toLowerCase());
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    hosts.add(process.env.REPLIT_DEV_DOMAIN.toLowerCase());
  }
  return hosts;
}

/**
 * CSRF mitigation: for state-changing methods, require the Origin (or Referer)
 * to match the request's Host or one of the configured Replit domains.
 * This is a lightweight defence-in-depth on top of SameSite=Lax cookies.
 */
export function enforceSameOrigin(req: Request, res: Response, next: NextFunction): void {
  if (!STATE_CHANGING.has(req.method)) {
    next();
    return;
  }
  const origin = req.get("origin") || req.get("referer");
  if (!origin) {
    // No browser cross-origin signal — typically curl or server-to-server. Allow.
    next();
    return;
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    res.status(403).json({ error: "أصل الطلب غير صالح" });
    return;
  }
  const allowed = getAllowedHosts(req);
  if (!allowed.has(originHost)) {
    res.status(403).json({ error: "أصل الطلب غير مسموح" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  enforceSameOrigin(req, res, next);
}
