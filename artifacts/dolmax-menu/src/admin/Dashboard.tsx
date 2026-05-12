import { Link } from "wouter";
import { LayoutGrid, Utensils, Image as ImageIcon, Settings } from "lucide-react";
import { AdminShell } from "./Layout";

const TILES = [
  { href: "/admin/categories", label: "إدارة الأقسام", icon: LayoutGrid, color: "from-emerald-500/20 to-emerald-500/5" },
  { href: "/admin/items", label: "إدارة الأصناف", icon: Utensils, color: "from-amber-500/20 to-amber-500/5" },
  { href: "/admin/images", label: "إدارة الصور", icon: ImageIcon, color: "from-sky-500/20 to-sky-500/5" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, color: "from-rose-500/20 to-rose-500/5" },
];

export function AdminDashboard() {
  return (
    <AdminShell title="لوحة التحكم" back={null}>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href}>
            <button className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${t.color} bg-card border border-border/40 active:scale-[0.97] hover:border-primary/60 transition flex flex-col items-center justify-center gap-3 p-4`}>
              <t.icon className="w-10 h-10 text-primary" />
              <span className="font-bold text-base text-center">{t.label}</span>
            </button>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        أهلاً بك في لوحة تحكم دولمكس · جميع التغييرات تظهر مباشرة في القائمة العامة
      </p>
    </AdminShell>
  );
}
