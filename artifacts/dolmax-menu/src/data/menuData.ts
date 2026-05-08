export type SizeOption = {
  id: string;
  label: string;
  pieces: number;
  price: number;
};

export type MenuCategory = 'fatta' | 'mahashi' | 'grape_leaves' | 'drinks' | 'sauces' | 'refreshing' | 'pilav';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sizes?: SizeOption[];
  pieceOptions?: string[];
  category: MenuCategory;
  image: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const img = (name: string) => `${BASE}/images/${name}`;

export const menuData: MenuItem[] = [
  // ─── الفتة ────────────────────────────────────────────────────────────────
  { id: 'f1', name: 'فتة ورق عنب',  price: 4500, category: 'fatta', image: img('fatta-warq-enab.png') },
  { id: 'f2', name: 'فتة الجبس',    price: 4500, category: 'fatta', image: img('fatta-jibis.png') },
  { id: 'f3', name: 'فتة الباقلاء', price: 4500, category: 'fatta', image: img('fatta-baqlawa.png') },
  { id: 'f4', name: 'فتة اندومي',   price: 4500, category: 'fatta', image: img('fatta-indomie.png') },
  { id: 'f5', name: 'فتة تكساس',    price: 4500, category: 'fatta', image: img('fatta-texas.png') },
  { id: 'f6', name: 'فتة باريكيو',  price: 4500, category: 'fatta', image: img('fatta-bbq.png') },
  { id: 'f7', name: 'فتة سبايسي',   price: 4500, category: 'fatta', image: img('fatta-spicy.jpg') },

  // ─── المحاشي ──────────────────────────────────────────────────────────────
  {
    id: 'm1',
    name: 'مشكل ليمون بدون لحم',
    description: 'الحبات اختياري: ورق عنب، بصل، شجر، لهانة، بطاطا',
    category: 'mahashi',
    image: img('mahashi-lemon.png'),
    pieceOptions: ['ورق عنب', 'بصل', 'شجر', 'لهانة', 'بطاطا'],
    sizes: [
      { id: 's_m',      label: 'M',               pieces: 7,  price: 3000  },
      { id: 's_l',      label: 'L',               pieces: 20, price: 8000  },
      { id: 's_xl',     label: 'XL',              pieces: 40, price: 15000 },
      { id: 's_xxl',    label: 'XXL',             pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق DOLMIX',       pieces: 14, price: 5000  },
      { id: 's_party',  label: 'صينية الضيافة',   pieces: 70, price: 25000 },
    ]
  },
  {
    id: 'm2',
    name: 'مشكل دبس الرمان مع لحم',
    description: 'الحبات اختياري: ورق عنب، بصل، شجر، بطاطا، فلفل، باذنجان، لهانة',
    category: 'mahashi',
    image: img('mahashi-pomegranate.png'),
    pieceOptions: ['ورق عنب', 'بصل', 'شجر', 'بطاطا', 'فلفل', 'باذنجان', 'لهانة'],
    sizes: [
      { id: 's_m',      label: 'M',               pieces: 7,  price: 4000  },
      { id: 's_l',      label: 'L',               pieces: 20, price: 9750  },
      { id: 's_xl',     label: 'XL',              pieces: 40, price: 19750 },
      { id: 's_xxl',    label: 'XXL',             pieces: 60, price: 28750 },
      { id: 's_dolmax', label: 'طبق DOLMIX',       pieces: 14, price: 6750  },
      { id: 's_party',  label: 'صينية الضيافة',   pieces: 70, price: 33750 },
    ]
  },
  {
    id: 'm3',
    name: 'دولمة سلك بدون لحم',
    description: 'حجم وسط',
    price: 16000,
    category: 'mahashi',
    image: img('mahashi-dolma.jpg'),
  },
  {
    id: 'm4',
    name: 'دولمة سلك باللحم',
    description: 'حجم وسط',
    price: 22000,
    category: 'mahashi',
    image: img('mahashi-dolma.jpg'),
  },

  // ─── ورق العنب ────────────────────────────────────────────────────────────
  {
    id: 'g1',
    name: 'ورق عنب ليمون',
    category: 'grape_leaves',
    image: img('grape-leaves-lemon.png'),
    sizes: [
      { id: 's_m',      label: 'M',           pieces: 7,  price: 3000  },
      { id: 's_l',      label: 'L',           pieces: 20, price: 8000  },
      { id: 's_xl',     label: 'XL',          pieces: 40, price: 15000 },
      { id: 's_xxl',    label: 'XXL',         pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق DOLMIX',  pieces: 14, price: 5000  },
    ]
  },
  {
    id: 'g2',
    name: 'ورق عنب دبس رمان',
    category: 'grape_leaves',
    image: img('grape-leaves-pomegranate.png'),
    sizes: [
      { id: 's_m',      label: 'M',           pieces: 7,  price: 3000  },
      { id: 's_l',      label: 'L',           pieces: 20, price: 8000  },
      { id: 's_xl',     label: 'XL',          pieces: 40, price: 15000 },
      { id: 's_xxl',    label: 'XXL',         pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق DOLMIX',  pieces: 14, price: 5000  },
    ]
  },
  {
    id: 'g3',
    name: 'ورق عنب سبايسي',
    category: 'grape_leaves',
    image: img('grape-leaves-spicy.png'),
    sizes: [
      { id: 's_m',      label: 'M',           pieces: 7,  price: 3000  },
      { id: 's_l',      label: 'L',           pieces: 20, price: 8000  },
      { id: 's_xl',     label: 'XL',          pieces: 40, price: 15000 },
      { id: 's_xxl',    label: 'XXL',         pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق DOLMIX',  pieces: 14, price: 5000  },
    ]
  },
  {
    id: 'g4',
    name: 'دولمة ورق عنب بدون لحم',
    description: 'حجم وسط',
    price: 16000,
    category: 'grape_leaves',
    image: img('grape-dolma.jpg'),
  },
  {
    id: 'g5',
    name: 'دولمة ورق عنب باللحم',
    description: 'حجم وسط',
    price: 22000,
    category: 'grape_leaves',
    image: img('grape-dolma.jpg'),
  },

  // ─── المشروبات ────────────────────────────────────────────────────────────
  { id: 'd1', name: 'بيبسي',  price: 500, category: 'drinks', image: img('drink-pepsi.png')  },
  { id: 'd2', name: 'سبرايت', price: 500, category: 'drinks', image: img('drink-sprite.png') },
  { id: 'd3', name: 'فانتا',  price: 500, category: 'drinks', image: img('drink-fanta.png')  },
  { id: 'd4', name: 'ديو',    price: 500, category: 'drinks', image: img('drink-dew.png')    },
  { id: 'd5', name: 'لبن',    price: 500, category: 'drinks', image: img('drink-laban.png')  },
  { id: 'd6', name: 'ماء',    price: 500, category: 'drinks', image: img('drink-water.png')  },

  // ─── الصوص ────────────────────────────────────────────────────────────────
  { id: 's1', name: 'صوص DOLMIX',   price: 500, category: 'sauces', image: img('sauce-dolmax.png') },
  { id: 's2', name: 'صوص سبايسي',  price: 500, category: 'sauces', image: img('sauce-spicy.png')  },
  { id: 's3', name: 'صوص تكساس',   price: 500, category: 'sauces', image: img('sauce-texas.png')  },
  { id: 's4', name: 'صوص باربيكيو', price: 500, category: 'sauces', image: img('sauce-bbq.png')   },

  // ─── المشروبات المنعشة ────────────────────────────────────────────────────
  { id: 'r1', name: 'موهيتو ليمون ونعناع', price: 3750, category: 'refreshing', image: img('mojito-lemon-mint.png')  },
  { id: 'r2', name: 'موهيتو رمان',          price: 3500, category: 'refreshing', image: img('mojito-pomegranate.png') },
  { id: 'r3', name: 'موهيتو باربي',         price: 5000, category: 'refreshing', image: img('mojito-berry.png')       },
  { id: 'r4', name: 'موهيتو بلوبيري',       price: 3500, category: 'refreshing', image: img('mojito-blueberry.png')   },
  { id: 'r5', name: 'آيس كوفي',             price: 2500, category: 'refreshing', image: img('ice-coffee.png')         },

  // ─── پيلاو ────────────────────────────────────────────────────────────────
  { id: 'p1', name: 'پيلاو تركي كلاسك',  price: 4500, description: 'المكونات: ارز تركي، حمص، دجاج', category: 'pilav', image: img('pilav-classic.jpg')  },
  { id: 'p2', name: 'پيلاو تركي كتشاب',  price: 4500, description: 'المكونات: ارز تركي، حمص، دجاج', category: 'pilav', image: img('pilav-ketchup.jpg')  },
  { id: 'p3', name: 'پيلاو تركي تكساس',  price: 5000, description: 'المكونات: ارز تركي، حمص، دجاج', category: 'pilav', image: img('pilav-texas.jpg')   },
];
