import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { api, type AdminItem, imageSrc } from "./api";
import { AdminShell } from "./Layout";

export function ImagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-items"],
    queryFn: () => api.get<AdminItem[]>("/admin/items"),
  });

  return (
    <AdminShell title="إدارة الصور">
      <p className="text-sm text-muted-foreground mb-3">
        اضغط على أي صنف لتغيير صورته. الصور المرفوعة تظهر مباشرة في القائمة.
      </p>
      {isLoading && <p className="text-center py-8 text-muted-foreground">جاري التحميل…</p>}
      <div className="grid grid-cols-2 gap-2">
        {data?.map((it) => (
          <Link key={it.id} href={`/admin/items/${it.id}`}>
            <button className="w-full text-right group relative">
              {it.imageUrl ? (
                <img
                  src={imageSrc(it.imageUrl)}
                  alt={it.name}
                  className="w-full aspect-square object-cover rounded-xl bg-muted border border-border/40"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl bg-muted border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  لا توجد صورة
                </div>
              )}
              <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <p className="mt-1 text-xs font-bold truncate">{it.name}</p>
            </button>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
