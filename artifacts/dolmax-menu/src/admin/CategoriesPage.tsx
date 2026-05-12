import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { api, type AdminCategory } from "./api";
import { AdminShell } from "./Layout";
import { toast } from "sonner";

// Lightweight Arabic→Latin transliteration so admins can leave the slug field
// blank and still get a human-readable URL identifier instead of `cat-<ts>`.
const AR_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h",
  خ: "kh", د: "d", ذ: "th", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d",
  ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m",
  ن: "n", ه: "h", و: "w", ي: "y", ى: "a", ة: "h", ء: "", ؤ: "w", ئ: "y", پ: "p",
};
function autoSlug(input: string): string {
  const base = input
    .trim()
    .split("")
    .map((ch) => AR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length >= 2) return base.slice(0, 40);
  // fall back to a short readable id when transliteration produced nothing
  return `cat-${Math.random().toString(36).slice(2, 8)}`;
}

export function CategoriesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<AdminCategory[]>("/admin/categories"),
  });

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const addMut = useMutation({
    mutationFn: () =>
      api.post<AdminCategory>("/admin/categories", {
        slug: newSlug || autoSlug(newName),
        nameAr: newName,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
      setAdding(false);
      setNewName("");
      setNewSlug("");
      toast.success("تمت إضافة القسم");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<AdminCategory> }) =>
      api.patch<AdminCategory>(`/admin/categories/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => api.del(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
      toast.success("تم الحذف");
    },
  });

  const reorderMut = useMutation({
    mutationFn: (orderedIds: number[]) => api.post("/admin/categories/reorder", { orderedIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });

  const move = (idx: number, dir: -1 | 1) => {
    if (!data) return;
    const next = [...data];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx]!, next[swap]!] = [next[swap]!, next[idx]!];
    reorderMut.mutate(next.map((c) => c.id));
  };

  return (
    <AdminShell title="إدارة الأقسام">
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full mb-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم جديد
        </button>
      )}

      {adding && (
        <div className="mb-4 p-4 rounded-xl bg-card border border-primary/40 space-y-3">
          <input
            placeholder="اسم القسم بالعربي"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
          <input
            placeholder="معرف القسم (اختياري - أحرف انجليزية)"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={() => addMut.mutate()}
              disabled={!newName.trim() || addMut.isPending}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {addMut.isPending ? "جاري الحفظ…" : "حفظ"}
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(""); setNewSlug(""); }}
              className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-bold"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-center py-8 text-muted-foreground">جاري التحميل…</p>}

      <div className="space-y-2">
        {data?.map((cat, idx) => (
          <div key={cat.id} className="bg-card border border-border/40 rounded-xl p-3">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-primary outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    updateMut.mutate({ id: cat.id, body: { nameAr: editName } });
                    setEditingId(null);
                  }}
                  className="p-2 rounded-lg bg-primary text-primary-foreground"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-bold ${cat.hidden ? "text-muted-foreground line-through" : ""}`}>
                    {cat.nameAr}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{cat.slug}</p>
                </div>
                <div className="flex flex-col">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30" aria-label="أعلى">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(idx, 1)} disabled={idx === (data?.length ?? 0) - 1} className="p-1 disabled:opacity-30" aria-label="أسفل">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => updateMut.mutate({ id: cat.id, body: { hidden: !cat.hidden } })}
                  className="p-2 rounded-lg hover:bg-muted"
                  title={cat.hidden ? "إظهار" : "إخفاء"}
                >
                  {cat.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-primary" />}
                </button>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.nameAr); }}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`حذف القسم "${cat.nameAr}"؟ سيتم حذف جميع الأصناف داخله.`)) {
                      delMut.mutate(cat.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
