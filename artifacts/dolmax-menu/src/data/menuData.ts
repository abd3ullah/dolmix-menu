export type SizeOption = {
  id: string;
  label: string;
  pieces: number;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number; // Used for items without sizes
  sizes?: SizeOption[];
  category: 'fatta' | 'mahashi' | 'grape_leaves';
  image?: string;
};

export const menuData: MenuItem[] = [
  // Fatta
  { id: 'f1', name: 'فتة ورق عنب', price: 3500, category: 'fatta' },
  { id: 'f2', name: 'فتة الجبس', price: 3500, category: 'fatta' },
  { id: 'f3', name: 'فتة الباقلاء', price: 5000, category: 'fatta' },
  { id: 'f4', name: 'فتة اندومي', price: 3500, category: 'fatta' },
  { id: 'f5', name: 'فتة تكساس', price: 4500, category: 'fatta' },
  { id: 'f6', name: 'فتة باريكيو', price: 4500, category: 'fatta' },
  { id: 'f7', name: 'فتة سبايسي', price: 3500, category: 'fatta' },

  // Mahashi
  {
    id: 'm1',
    name: 'مشكل ليمون بدون لحم',
    description: 'ملاحظة: الحبات اختياري (ورق عنب، بصل، شجر)',
    category: 'mahashi',
    sizes: [
      { id: 's_m', label: 'M', pieces: 7, price: 3000 },
      { id: 's_l', label: 'L', pieces: 20, price: 8000 },
      { id: 's_xl', label: 'XL', pieces: 40, price: 15000 },
      { id: 's_xxl', label: 'XXL', pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق دولمكس', pieces: 14, price: 5000 },
      { id: 's_party', label: 'طبق العزائم - صينية الضيافة', pieces: 70, price: 25000 },
    ]
  },
  {
    id: 'm2',
    name: 'مشكل دبس الرمان مع لحم',
    description: 'ملاحظة: الحبات اختياري (ورق عنب، بصل، شجر، بطاطا، فلفل، باذنجان)',
    category: 'mahashi',
    sizes: [
      { id: 's_m', label: 'M', pieces: 7, price: 4000 },
      { id: 's_l', label: 'L', pieces: 20, price: 9750 },
      { id: 's_xl', label: 'XL', pieces: 40, price: 19750 },
      { id: 's_xxl', label: 'XXL', pieces: 60, price: 28750 },
      { id: 's_dolmax', label: 'طبق دولمكس', pieces: 14, price: 6750 },
      { id: 's_party', label: 'طبق العزائم - صينية الضيافة', pieces: 70, price: 33750 },
    ]
  },

  // Grape Leaves
  {
    id: 'g1',
    name: 'ورق عنب ليمون',
    category: 'grape_leaves',
    sizes: [
      { id: 's_m', label: 'M', pieces: 7, price: 3000 },
      { id: 's_l', label: 'L', pieces: 20, price: 8000 },
      { id: 's_xl', label: 'XL', pieces: 40, price: 15000 },
      { id: 's_xxl', label: 'XXL', pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق دولمكس', pieces: 14, price: 5000 },
    ]
  },
  {
    id: 'g2',
    name: 'ورق عنب دبس رمان',
    category: 'grape_leaves',
    sizes: [
      { id: 's_m', label: 'M', pieces: 7, price: 3000 },
      { id: 's_l', label: 'L', pieces: 20, price: 8000 },
      { id: 's_xl', label: 'XL', pieces: 40, price: 15000 },
      { id: 's_xxl', label: 'XXL', pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق دولمكس', pieces: 14, price: 5000 },
    ]
  },
  {
    id: 'g3',
    name: 'ورق عنب سبايسي',
    category: 'grape_leaves',
    sizes: [
      { id: 's_m', label: 'M', pieces: 7, price: 3000 },
      { id: 's_l', label: 'L', pieces: 20, price: 8000 },
      { id: 's_xl', label: 'XL', pieces: 40, price: 15000 },
      { id: 's_xxl', label: 'XXL', pieces: 60, price: 23000 },
      { id: 's_dolmax', label: 'طبق دولمكس', pieces: 14, price: 5000 },
    ]
  },
];
