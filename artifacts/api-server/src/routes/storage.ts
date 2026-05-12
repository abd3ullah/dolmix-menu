import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "../lib/objectStorage";
import { getObjectAclPolicy } from "../lib/objectAcl";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_CONTENT_TYPE = /^image\/(png|jpe?g|webp|gif|avif)$/i;

const RequestUploadUrlBody = z.object({
  name: z.string().min(1).max(200),
  size: z.number().int().nonnegative().max(MAX_UPLOAD_BYTES, "الحد الأقصى للصورة 5 ميغابايت"),
  contentType: z
    .string()
    .min(1)
    .refine((v) => ALLOWED_CONTENT_TYPE.test(v), "نوع الملف يجب أن يكون صورة (PNG/JPG/WebP/GIF/AVIF)"),
});

router.post("/storage/uploads/request-url", requireAdmin, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Missing or invalid required fields",
    });
    return;
  }
  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath, metadata: parsed.data });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

const FinalizeBody = z.object({
  objectPath: z.string().regex(/^\/objects\/[\w./-]+$/, "مسار غير صالح"),
});

/**
 * Called by the admin client after a presigned PUT completes.
 * Marks the freshly-uploaded object as publicly readable so the
 * /storage/objects/* serving endpoint can hand it out without auth.
 */
router.post("/storage/uploads/finalize", requireAdmin, async (req: Request, res: Response) => {
  const parsed = FinalizeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" });
    return;
  }
  try {
    const normalized = await objectStorageService.trySetObjectEntityAclPolicy(parsed.data.objectPath, {
      owner: req.session.username || "admin",
      visibility: "public",
    });
    res.json({ ok: true, objectPath: normalized });
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "الكائن غير موجود" });
      return;
    }
    req.log.error({ err }, "Error finalising upload");
    res.status(500).json({ error: "فشل إنهاء الرفع" });
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const response = await objectStorageService.downloadObject(file);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    // ACL enforcement:
    // - public visibility → serve to anyone (menu images)
    // - missing policy → treat as public for backward compatibility with legacy
    //   uploads that predate the ACL system (these were already accessible)
    // - private → require an authenticated admin session
    const aclPolicy = await getObjectAclPolicy(objectFile);
    const isPublic = !aclPolicy || aclPolicy.visibility === "public";
    if (!isPublic && !req.session?.isAdmin) {
      res.status(403).json({ error: "غير مصرح" });
      return;
    }

    const response = await objectStorageService.downloadObject(objectFile);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
