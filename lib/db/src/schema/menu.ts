import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const itemsTable = pgTable("items", {
  id: serial("id").primaryKey(),
  legacyId: text("legacy_id"),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price"),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  sizesEnabled: boolean("sizes_enabled").notNull().default(false),
  requiresSize: boolean("requires_size").notNull().default(false),
  pieceOptionsEnabled: boolean("piece_options_enabled").notNull().default(false),
  pieceOptionsRequired: boolean("piece_options_required").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sizesTable = pgTable("sizes", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => itemsTable.id, { onDelete: "cascade" }),
  legacyId: text("legacy_id"),
  label: text("label").notNull(),
  pieces: integer("pieces").notNull().default(0),
  price: integer("price").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const pieceOptionsTable = pgTable("piece_options", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => itemsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
});

export type Category = typeof categoriesTable.$inferSelect;
export type Item = typeof itemsTable.$inferSelect;
export type Size = typeof sizesTable.$inferSelect;
export type PieceOption = typeof pieceOptionsTable.$inferSelect;
export type Setting = typeof settingsTable.$inferSelect;
