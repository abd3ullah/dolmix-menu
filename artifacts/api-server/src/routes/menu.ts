import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  categoriesTable,
  itemsTable,
  sizesTable,
  pieceOptionsTable,
  settingsTable,
} from "@workspace/db";
import { asc, eq } from "drizzle-orm";

const router: IRouter = Router();

// Public menu — returns categories (visible only) with items, sizes, piece options
router.get("/menu", async (_req, res) => {
  const cats = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.hidden, false))
    .orderBy(asc(categoriesTable.displayOrder), asc(categoriesTable.id));

  const items = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.hidden, false))
    .orderBy(asc(itemsTable.displayOrder), asc(itemsTable.id));

  const allSizes = await db.select().from(sizesTable).orderBy(asc(sizesTable.displayOrder), asc(sizesTable.id));
  const allOpts = await db.select().from(pieceOptionsTable).orderBy(asc(pieceOptionsTable.displayOrder), asc(pieceOptionsTable.id));

  const visibleCatIds = new Set(cats.map((c) => c.id));
  const sizesByItem = new Map<number, typeof allSizes>();
  for (const s of allSizes) {
    if (!sizesByItem.has(s.itemId)) sizesByItem.set(s.itemId, []);
    sizesByItem.get(s.itemId)!.push(s);
  }
  const optsByItem = new Map<number, typeof allOpts>();
  for (const o of allOpts) {
    if (!optsByItem.has(o.itemId)) optsByItem.set(o.itemId, []);
    optsByItem.get(o.itemId)!.push(o);
  }

  const settings = await db.select().from(settingsTable);
  const settingsMap: Record<string, unknown> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const resolveImage = (url: string | null | undefined): string => {
    if (!url) return "";
    if (url.startsWith("/objects/")) return `/api/storage${url}`;
    return url;
  };

  const itemsOut = items
    .filter((i) => visibleCatIds.has(i.categoryId))
    .map((i) => {
      const cat = cats.find((c) => c.id === i.categoryId);
      const sizes = i.sizesEnabled ? (sizesByItem.get(i.id) ?? []) : [];
      const pieceOptions = i.pieceOptionsEnabled ? (optsByItem.get(i.id) ?? []).map((o) => o.label) : [];
      return {
        id: i.legacyId || `item-${i.id}`,
        dbId: i.id,
        name: i.name,
        description: i.description ?? undefined,
        price: i.price ?? undefined,
        category: cat?.slug,
        image: resolveImage(i.imageUrl),
        requiresSize: i.requiresSize,
        pieceOptionsRequired: i.pieceOptionsRequired,
        featured: i.isFeatured,
        sizes: sizes.length
          ? sizes.map((s) => ({
              id: s.legacyId || `size-${s.id}`,
              label: s.label,
              pieces: s.pieces,
              price: s.price,
            }))
          : undefined,
        pieceOptions: pieceOptions.length ? pieceOptions : undefined,
      };
    });

  res.json({
    categories: cats.map((c) => ({ id: c.slug, label: c.nameAr })),
    items: itemsOut,
    settings: settingsMap,
  });
});

export default router;
