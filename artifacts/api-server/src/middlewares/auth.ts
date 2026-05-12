import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    username?: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.isAdmin) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}
