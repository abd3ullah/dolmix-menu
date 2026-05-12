import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  categoriesTable,
  itemsTable,
  sizesTable,
  pieceOptionsTable,
  settingsTable,
} from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAdmin);

// ─── Categories ─────────────────────────────────────────────────────────────
router.get("/admin/categories", async (_req, res) => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.displayOrder), asc(categoriesTable.id));
  res.json(rows);
});

const CategoryBody = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9_-]+$/, "اللاحقة يجب أن تكون أحرف انجليزية صغيرة"),
  nameAr: z.string().min(1),
  hidden: z.boolean().optional(),
});

router.post("/admin/categories", async (req, res) => {
  const parsed = CategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }
  const last = await db
    .select({ d: categoriesTable.displayOrder })
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.displayOrder));
  const nextOrder = (last[last.length - 1]?.d ?? -1) + 1;
  try {
    const [row] = await db
      .insert(categoriesTable)
      .values({
        slug: parsed.data.slug,
        nameAr: parsed.data.nameAr,
        hidden: parsed.data.hidden ?? false,
        displayOrder: nextOrder,
      })
      .returning();
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: "اللاحقة موجودة سابقاً" });
  }
});

const CategoryUpdate = z.object({
  nameAr: z.string().min(1).optional(),
  hidden: z.boolean().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9_-]+$/).optional(),
});

router.patch("/admin/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = CategoryUpdate.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const [row] = await db.update(categoriesTable).set(parsed.data).where(eq(categoriesTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "غير موجود" });
    return;
  }
  res.json(row);
});

router.delete("/admin/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/categories/reorder", async (req, res) => {
  const Body = z.object({ orderedIds: z.array(z.number().int()) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  for (let i = 0; i < parsed.data.orderedIds.length; i++) {
    const id = parsed.data.orderedIds[i]!;
    await db.update(categoriesTable).set({ displayOrder: i }).where(eq(categoriesTable.id, id));
  }
  res.json({ ok: true });
});

// ─── Items ──────────────────────────────────────────────────────────────────
router.get("/admin/items", async (req, res) => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const rows = categoryId
    ? await db
        .select()
        .from(itemsTable)
        .where(eq(itemsTable.categoryId, categoryId))
        .orderBy(asc(itemsTable.displayOrder), asc(itemsTable.id))
    : await db.select().from(itemsTable).orderBy(asc(itemsTable.displayOrder), asc(itemsTable.id));
  res.json(rows);
});

router.get("/admin/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "غير موجود" });
    return;
  }
  const sizes = await db
    .select()
    .from(sizesTable)
    .where(eq(sizesTable.itemId, id))
    .orderBy(asc(sizesTable.displayOrder), asc(sizesTable.id));
  const pieceOptions = await db
    .select()
    .from(pieceOptionsTable)
    .where(eq(pieceOptionsTable.itemId, id))
    .orderBy(asc(pieceOptionsTable.displayOrder), asc(pieceOptionsTable.id));
  res.json({ ...item, sizes, pieceOptions });
});

const ItemBody = z.object({
  categoryId: z.number().int(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().int().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  hidden: z.boolean().optional(),
  sizesEnabled: z.boolean().optional(),
  requiresSize: z.boolean().optional(),
  pieceOptionsEnabled: z.boolean().optional(),
  pieceOptionsRequired: z.boolean().optional(),
});

router.post("/admin/items", async (req, res) => {
  const parsed = ItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }
  const last = await db
    .select({ d: itemsTable.displayOrder })
    .from(itemsTable)
    .orderBy(asc(itemsTable.displayOrder));
  const nextOrder = (last[last.length - 1]?.d ?? -1) + 1;
  const [row] = await db
    .insert(itemsTable)
    .values({ ...parsed.data, displayOrder: nextOrder })
    .returning();
  res.json(row);
});

router.patch("/admin/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = ItemBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const [row] = await db.update(itemsTable).set(parsed.data).where(eq(itemsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "غير موجود" });
    return;
  }
  res.json(row);
});

router.delete("/admin/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(itemsTable).where(eq(itemsTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/items/reorder", async (req, res) => {
  const Body = z.object({ orderedIds: z.array(z.number().int()) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  for (let i = 0; i < parsed.data.orderedIds.length; i++) {
    const id = parsed.data.orderedIds[i]!;
    await db.update(itemsTable).set({ displayOrder: i }).where(eq(itemsTable.id, id));
  }
  res.json({ ok: true });
});

// ─── Sizes ──────────────────────────────────────────────────────────────────
const SizeBody = z.object({
  itemId: z.number().int(),
  label: z.string().min(1),
  pieces: z.number().int().nonnegative().default(0),
  price: z.number().int().nonnegative(),
});

router.post("/admin/sizes", async (req, res) => {
  const parsed = SizeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const last = await db
    .select({ d: sizesTable.displayOrder })
    .from(sizesTable)
    .where(eq(sizesTable.itemId, parsed.data.itemId))
    .orderBy(asc(sizesTable.displayOrder));
  const nextOrder = (last[last.length - 1]?.d ?? -1) + 1;
  const [row] = await db.insert(sizesTable).values({ ...parsed.data, displayOrder: nextOrder }).returning();
  res.json(row);
});

router.patch("/admin/sizes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = SizeBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const [row] = await db.update(sizesTable).set(parsed.data).where(eq(sizesTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "غير موجود" });
    return;
  }
  res.json(row);
});

router.delete("/admin/sizes/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(sizesTable).where(eq(sizesTable.id, id));
  res.json({ ok: true });
});

router.post("/admin/sizes/reorder", async (req, res) => {
  const Body = z.object({ orderedIds: z.array(z.number().int()) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  for (let i = 0; i < parsed.data.orderedIds.length; i++) {
    const id = parsed.data.orderedIds[i]!;
    await db.update(sizesTable).set({ displayOrder: i }).where(eq(sizesTable.id, id));
  }
  res.json({ ok: true });
});

// ─── Piece Options ─────────────────────────────────────────────────────────
const PieceOptionBody = z.object({
  itemId: z.number().int(),
  label: z.string().min(1),
});

router.post("/admin/piece-options", async (req, res) => {
  const parsed = PieceOptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const last = await db
    .select({ d: pieceOptionsTable.displayOrder })
    .from(pieceOptionsTable)
    .where(eq(pieceOptionsTable.itemId, parsed.data.itemId))
    .orderBy(asc(pieceOptionsTable.displayOrder));
  const nextOrder = (last[last.length - 1]?.d ?? -1) + 1;
  const [row] = await db
    .insert(pieceOptionsTable)
    .values({ ...parsed.data, displayOrder: nextOrder })
    .returning();
  res.json(row);
});

router.patch("/admin/piece-options/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = PieceOptionBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const [row] = await db.update(pieceOptionsTable).set(parsed.data).where(eq(pieceOptionsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "غير موجود" });
    return;
  }
  res.json(row);
});

router.delete("/admin/piece-options/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(pieceOptionsTable).where(eq(pieceOptionsTable.id, id));
  res.json({ ok: true });
});

// ─── Settings ──────────────────────────────────────────────────────────────
router.get("/admin/settings", async (_req, res) => {
  const rows = await db.select().from(settingsTable);
  const out: Record<string, unknown> = {};
  for (const s of rows) out[s.key] = s.value;
  res.json(out);
});

const SettingsBody = z.record(z.string(), z.unknown());

router.put("/admin/settings", async (req, res) => {
  const parsed = SettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    await db
      .insert(settingsTable)
      .values({ key, value: value as never })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: value as never },
      });
  }
  res.json({ ok: true });
});

export default router;
