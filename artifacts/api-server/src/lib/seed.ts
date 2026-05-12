import { db } from "@workspace/db";
import {
  categoriesTable,
  itemsTable,
  sizesTable,
  pieceOptionsTable,
  settingsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedSize = { legacyId: string; label: string; pieces: number; price: number };
type SeedItem = {
  legacyId: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl: string;
  categorySlug: string;
  sizes?: SeedSize[];
  pieceOptions?: string[];
  requiresSize?: boolean;
};

const CATEGORIES = [
  { slug: "grape_leaves", nameAr: "ورق عنب" },
  { slug: "mahashi", nameAr: "محاشي" },
  { slug: "dolma", nameAr: "دولمة" },
  { slug: "sauces", nameAr: "صوص" },
  { slug: "fatta", nameAr: "فتة" },
  { slug: "pilav", nameAr: "پيلاو" },
  { slug: "fettuccine", nameAr: "فيتوشيني" },
  { slug: "drinks", nameAr: "المشروبات" },
  { slug: "refreshing", nameAr: "مشروبات منعشه" },
];

const STANDARD_SIZES = (basePrice: number): SeedSize[] => [
  { legacyId: "s_m", label: "M", pieces: 7, price: basePrice },
  { legacyId: "s_l", label: "L", pieces: 20, price: Math.round(basePrice * 2.67) },
  { legacyId: "s_xl", label: "XL", pieces: 40, price: Math.round(basePrice * 5) },
  { legacyId: "s_xxl", label: "XXL", pieces: 60, price: Math.round(basePrice * 7.67) },
  { legacyId: "s_dolmax", label: "طبق DOLMIX", pieces: 14, price: Math.round(basePrice * 1.67) },
  { legacyId: "s_party", label: "صينية الضيافة", pieces: 70, price: Math.round(basePrice * 8.33) },
  { legacyId: "s_happy", label: "بوكس السعادة", pieces: 50, price: Math.round(basePrice * 6.33) },
];

const img = (n: string) => `/images/${n}`;

const ITEMS: SeedItem[] = [
  // فتة
  { legacyId: "f1", name: "فتة ورق عنب", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-warq-enab.jpg") },
  { legacyId: "f2", name: "فتة الجبس", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-jibis.jpg") },
  { legacyId: "f3", name: "فتة الباقلاء", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-baqlawa.jpg") },
  { legacyId: "f4", name: "فتة اندومي", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-indomie.jpg") },
  { legacyId: "f5", name: "فتة تكساس", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-texas.jpg") },
  { legacyId: "f6", name: "فتة باربيكيو", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-bbq.jpg") },
  { legacyId: "f7", name: "فتة سبايسي", price: 4500, categorySlug: "fatta", imageUrl: img("fatta-spicy.jpg") },

  // محاشي
  {
    legacyId: "m1",
    name: "مشكل ليمون بدون لحم",
    description: "الحبات اختياري: ورق عنب، بصل، شجر، لهانة، بطاطا",
    categorySlug: "mahashi",
    imageUrl: img("mahashi-lemon.jpg"),
    pieceOptions: ["ورق عنب", "بصل", "شجر", "لهانة", "بطاطا"],
    sizes: [
      { legacyId: "s_m", label: "M", pieces: 7, price: 3000 },
      { legacyId: "s_l", label: "L", pieces: 20, price: 8000 },
      { legacyId: "s_xl", label: "XL", pieces: 40, price: 15000 },
      { legacyId: "s_xxl", label: "XXL", pieces: 60, price: 23000 },
      { legacyId: "s_dolmax", label: "طبق DOLMIX", pieces: 14, price: 5000 },
      { legacyId: "s_party", label: "صينية الضيافة", pieces: 70, price: 25000 },
      { legacyId: "s_happy", label: "بوكس السعادة", pieces: 50, price: 19000 },
    ],
  },
  {
    legacyId: "m2",
    name: "مشكل دبس الرمان مع لحم",
    description: "الحبات اختياري: ورق عنب، بصل، شجر، بطاطا، فلفل، باذنجان، لهانة",
    categorySlug: "mahashi",
    imageUrl: img("mahashi-pomegranate.jpg"),
    pieceOptions: ["ورق عنب", "بصل", "شجر", "بطاطا", "فلفل", "باذنجان", "لهانة"],
    sizes: [
      { legacyId: "s_m", label: "M", pieces: 7, price: 4000 },
      { legacyId: "s_l", label: "L", pieces: 20, price: 9750 },
      { legacyId: "s_xl", label: "XL", pieces: 40, price: 19750 },
      { legacyId: "s_xxl", label: "XXL", pieces: 60, price: 28750 },
      { legacyId: "s_dolmax", label: "طبق DOLMIX", pieces: 14, price: 6750 },
      { legacyId: "s_party", label: "صينية الضيافة", pieces: 70, price: 33750 },
      { legacyId: "s_happy", label: "بوكس السعادة", pieces: 50, price: 24500 },
    ],
  },

  // دولمة
  {
    legacyId: "m3",
    name: "دولمة سلك بدون لحم",
    categorySlug: "dolma",
    imageUrl: img("mahashi-dolma.jpg"),
    requiresSize: true,
    sizes: [
      { legacyId: "s_med", label: "حجم وسط", pieces: 0, price: 12000 },
      { legacyId: "s_large", label: "حجم كبير", pieces: 0, price: 16000 },
    ],
  },
  {
    legacyId: "m4",
    name: "دولمة سلك باللحم",
    categorySlug: "dolma",
    imageUrl: img("mahashi-dolma.jpg"),
    requiresSize: true,
    sizes: [
      { legacyId: "s_med", label: "حجم وسط", pieces: 0, price: 18000 },
      { legacyId: "s_large", label: "حجم كبير", pieces: 0, price: 22000 },
    ],
  },

  // ورق عنب
  ...["g1", "g2", "g3"].map((id, idx) => {
    const names = ["ورق عنب ليمون", "ورق عنب دبس رمان", "ورق عنب سبايسي"];
    const imgs = ["grape-leaves-lemon.jpg", "grape-leaves-pomegranate.jpg", "grape-leaves-spicy.jpg"];
    return {
      legacyId: id,
      name: names[idx]!,
      categorySlug: "grape_leaves",
      imageUrl: img(imgs[idx]!),
      sizes: STANDARD_SIZES(3000),
    } as SeedItem;
  }),

  {
    legacyId: "g4",
    name: "دولمة ورق عنب بدون لحم",
    categorySlug: "dolma",
    imageUrl: img("grape-dolma.jpg"),
    requiresSize: true,
    sizes: [
      { legacyId: "s_med", label: "حجم وسط", pieces: 0, price: 12000 },
      { legacyId: "s_large", label: "حجم كبير", pieces: 0, price: 16000 },
    ],
  },
  {
    legacyId: "g5",
    name: "دولمة ورق عنب باللحم",
    categorySlug: "dolma",
    imageUrl: img("grape-dolma.jpg"),
    requiresSize: true,
    sizes: [
      { legacyId: "s_med", label: "حجم وسط", pieces: 0, price: 18000 },
      { legacyId: "s_large", label: "حجم كبير", pieces: 0, price: 22000 },
    ],
  },

  // مشروبات
  { legacyId: "d1", name: "بيبسي", price: 500, categorySlug: "drinks", imageUrl: img("drink-pepsi.jpg") },
  { legacyId: "d2", name: "سبرايت", price: 500, categorySlug: "drinks", imageUrl: img("drink-sprite.jpg") },
  { legacyId: "d3", name: "فانتا", price: 500, categorySlug: "drinks", imageUrl: img("drink-fanta.jpg") },
  { legacyId: "d4", name: "ديو", price: 500, categorySlug: "drinks", imageUrl: img("drink-dew.webp") },
  { legacyId: "d5", name: "لبن", price: 500, categorySlug: "drinks", imageUrl: img("drink-laban.png") },
  { legacyId: "d6", name: "ماء", price: 500, categorySlug: "drinks", imageUrl: img("drink-water.jpg") },

  // صوص
  { legacyId: "s1", name: "صوص DOLMIX", price: 500, categorySlug: "sauces", imageUrl: img("sauce-dolmax.png") },
  { legacyId: "s2", name: "صوص سبايسي", price: 500, categorySlug: "sauces", imageUrl: img("sauce-spicy.png") },
  { legacyId: "s3", name: "صوص تكساس", price: 500, categorySlug: "sauces", imageUrl: img("sauce-texas.png") },
  { legacyId: "s4", name: "صوص باربيكيو", price: 500, categorySlug: "sauces", imageUrl: img("sauce-bbq.png") },

  // مشروبات منعشة
  { legacyId: "r1", name: "موهيتو ليمون ونعناع", price: 3750, categorySlug: "refreshing", imageUrl: img("mojito-lemon-mint.png") },
  { legacyId: "r2", name: "موهيتو رمان", price: 3500, categorySlug: "refreshing", imageUrl: img("mojito-pomegranate.png") },
  { legacyId: "r3", name: "موهيتو باربي", price: 5000, categorySlug: "refreshing", imageUrl: img("mojito-berry.png") },
  { legacyId: "r4", name: "موهيتو بلوبيري", price: 3500, categorySlug: "refreshing", imageUrl: img("mojito-blueberry.png") },
  { legacyId: "r5", name: "آيس كوفي", price: 2500, categorySlug: "refreshing", imageUrl: img("ice-coffee.png") },

  // فيتوشيني
  {
    legacyId: "fe1",
    name: "فيتوشيني الفريدو",
    price: 7000,
    description: "المكونات: معكرونه طازجة، دجاج، فطر، مع الكريمة",
    categorySlug: "fettuccine",
    imageUrl: img("fettuccine-alfredo.jpg"),
  },

  // پيلاو
  { legacyId: "p1", name: "پيلاو تركي كلاسك", price: 4500, description: "المكونات: ارز تركي، حمص، دجاج", categorySlug: "pilav", imageUrl: img("pilav-classic.jpg") },
  { legacyId: "p2", name: "پيلاو تركي كتشاب", price: 4500, description: "المكونات: ارز تركي، حمص، دجاج", categorySlug: "pilav", imageUrl: img("pilav-ketchup.jpg") },
  { legacyId: "p3", name: "پيلاو تركي تكساس", price: 5000, description: "المكونات: ارز تركي، حمص، دجاج", categorySlug: "pilav", imageUrl: img("pilav-texas.jpg") },
];

const DEFAULT_SETTINGS = [
  { key: "restaurant_name", value: "دولمكس" },
  { key: "whatsapp_number", value: "9647706101600" },
  { key: "phone_number", value: "07706101600" },
];

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(categoriesTable);
  const count = existing[0]?.c ?? 0;
  if (count > 0) {
    logger.info({ categories: count }, "Seed skipped — data already present");
    return;
  }
  logger.info("Seeding initial menu data");

  const slugToId = new Map<string, number>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i]!;
    const [row] = await db
      .insert(categoriesTable)
      .values({ slug: c.slug, nameAr: c.nameAr, displayOrder: i, hidden: false })
      .returning();
    slugToId.set(c.slug, row!.id);
  }

  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i]!;
    const catId = slugToId.get(it.categorySlug);
    if (!catId) continue;
    const [row] = await db
      .insert(itemsTable)
      .values({
        legacyId: it.legacyId,
        categoryId: catId,
        name: it.name,
        description: it.description ?? null,
        price: it.price ?? null,
        imageUrl: it.imageUrl,
        displayOrder: i,
        hidden: false,
        sizesEnabled: !!(it.sizes && it.sizes.length > 0),
        requiresSize: !!it.requiresSize,
        pieceOptionsEnabled: !!(it.pieceOptions && it.pieceOptions.length > 0),
        pieceOptionsRequired: false,
      })
      .returning();
    const itemId = row!.id;

    if (it.sizes) {
      for (let s = 0; s < it.sizes.length; s++) {
        const sz = it.sizes[s]!;
        await db.insert(sizesTable).values({
          itemId,
          legacyId: sz.legacyId,
          label: sz.label,
          pieces: sz.pieces,
          price: sz.price,
          displayOrder: s,
        });
      }
    }
    if (it.pieceOptions) {
      for (let p = 0; p < it.pieceOptions.length; p++) {
        await db.insert(pieceOptionsTable).values({
          itemId,
          label: it.pieceOptions[p]!,
          displayOrder: p,
        });
      }
    }
  }

  for (const s of DEFAULT_SETTINGS) {
    await db.insert(settingsTable).values({ key: s.key, value: s.value }).onConflictDoNothing();
  }

  logger.info("Seed complete");
}
