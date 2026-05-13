import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { api, type AdminCategory, type AdminItem, imageSrc } from "./api";
import { AdminShell } from "./Layout";
import { toast } from "sonner";

export function ItemsPage() {
  const qc = useQueryClient();
  const [filterCat, setFilterCat] = useState<number | "all">("all");

  const { data: cats } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<AdminCategory[]>("/admin/categories"),
  });
  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-items"],
    queryFn: () => api.get<AdminItem[]>("/admin/items"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<AdminItem> }) =>
      api.patch(`/admin/items/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-items"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => api.del(`/admin/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-items"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
      toast.success("تم الحذف");
    },
  });

  const reorderMut = useMutation({
    mutationFn: (orderedIds: number[]) => api.post("/admin/items/reorder", { orderedIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-items"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });

  const filtered = (items ?? []).filter((i) => filterCat === "all" || i.categoryId === filterCat);

  const move = (idx: number, dir: -1 | 1) => {
    const list = filtered;
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    const next = [...list];
    [next[idx]!, next[swap]!] = [next[swap]!, next[idx]!];
    // reorder uses global ordering; we send full ordered list
    const ordered = (items ?? [])
      .map((i) => (i.id === next[idx]!.id ? next[swap]!.id : i.id === next[swap]!.id ? next[idx]!.id : i.id))
      ;
    reorderMut.mutate(ordered);
  };

  const catName = (id: number) => cats?.find((c) => c.id === id)?.nameAr ?? "—";

  return (
    <AdminShell title="إدارة الأصناف">
      <Link href="/items/new">
        <button className="w-full mb-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          إضافة صنف جديد
        </button>
      </Link>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setFilterCat("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold ${
            filterCat === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
          }`}
        >
          الكل
        </button>
        {cats?.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCat(c.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold ${
              filterCat === c.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
            }`}
          >
            {c.nameAr}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-center py-8 text-muted-foreground">جاري التحميل…</p>}

      <div className="space-y-2">
        {filtered.map((it, idx) => (
          <div key={it.id} className="bg-card border border-border/40 rounded-xl p-3 flex gap-3 items-center">
            {it.imageUrl ? (
              <img src={imageSrc(it.imageUrl)} alt={it.name} className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate ${it.hidden ? "text-muted-foreground line-through" : ""}`}>{it.name}</p>
              <p className="text-xs text-muted-foreground">
                {catName(it.categoryId)}
                {it.price ? ` · ${it.price.toLocaleString("ar")} د.ع` : it.sizesEnabled ? " · بأحجام" : ""}
              </p>
            </div>
            <div className="flex flex-col">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(idx, 1)} disabled={idx === filtered.length - 1} className="p-1 disabled:opacity-30">
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => updateMut.mutate({ id: it.id, body: { hidden: !it.hidden } })}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {it.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-primary" />}
            </button>
            <Link href={`/items/${it.id}`}>
              <button className="p-2 rounded-lg hover:bg-muted">
                <Pencil className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => {
                if (confirm(`حذف "${it.name}"؟`)) delMut.mutate(it.id);
              }}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا توجد أصناف</p>
        )}
      </div>
    </AdminShell>
  );
}
