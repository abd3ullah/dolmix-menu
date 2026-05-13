import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  api,
  type AdminCategory,
  type AdminItem,
  type AdminItemFull,
} from "./api";
import { AdminShell } from "./Layout";
import { ImageInput } from "./ImageInput";
import { toast } from "sonner";

type Form = {
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  categoryId: number | null;
  hidden: boolean;
  sizesEnabled: boolean;
  requiresSize: boolean;
  pieceOptionsEnabled: boolean;
  pieceOptionsRequired: boolean;
  isFeatured: boolean;
};

const empty: Form = {
  name: "",
  description: "",
  price: "",
  imageUrl: null,
  categoryId: null,
  hidden: false,
  sizesEnabled: false,
  requiresSize: false,
  pieceOptionsEnabled: false,
  pieceOptionsRequired: false,
  isFeatured: false,
};

export function ItemEditPage() {
  const [, navigate] = useLocation();
  const [matchEdit, params] = useRoute<{ id: string }>("/items/:id");
  const isNew = !matchEdit || params?.id === "new";
  const itemId = isNew ? null : Number(params?.id);
  const qc = useQueryClient();

  const { data: cats } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<AdminCategory[]>("/admin/categories"),
  });
  const { data: existing } = useQuery({
    queryKey: ["admin-item", itemId],
    queryFn: () => api.get<AdminItemFull>(`/admin/items/${itemId}`),
    enabled: !!itemId,
  });

  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description ?? "",
        price: existing.price?.toString() ?? "",
        imageUrl: existing.imageUrl,
        categoryId: existing.categoryId,
        hidden: existing.hidden,
        sizesEnabled: existing.sizesEnabled,
        requiresSize: existing.requiresSize,
        pieceOptionsEnabled: existing.pieceOptionsEnabled,
        pieceOptionsRequired: existing.pieceOptionsRequired,
        isFeatured: existing.isFeatured ?? false,
      });
    } else if (isNew && cats && form.categoryId === null && cats[0]) {
      setForm((f) => ({ ...f, categoryId: cats[0]!.id }));
    }
  }, [existing, isNew, cats]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.categoryId) throw new Error("اختر القسم");
      const body = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price ? Number(form.price) : null,
        imageUrl: form.imageUrl,
        hidden: form.hidden,
        sizesEnabled: form.sizesEnabled,
        requiresSize: form.requiresSize,
        pieceOptionsEnabled: form.pieceOptionsEnabled,
        pieceOptionsRequired: form.pieceOptionsRequired,
        isFeatured: form.isFeatured,
      };
      if (isNew) return api.post<AdminItem>("/admin/items", body);
      return api.patch<AdminItem>(`/admin/items/${itemId}`, body);
    },
    onSuccess: (row: AdminItem) => {
      qc.invalidateQueries({ queryKey: ["admin-items"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
      toast.success("تم الحفظ");
      if (isNew) navigate(`/items/${row.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title={isNew ? "إضافة صنف" : "تعديل صنف"} back="/items">
      <div className="space-y-4">
        <Field label="الاسم">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
        </Field>

        <Field label="القسم">
          <select
            value={form.categoryId ?? ""}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          >
            <option value="">— اختر —</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </Field>

        <Field label="السعر (د.ع) — اتركه فارغاً إذا الصنف بأحجام">
          <input
            inputMode="numeric"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, "") })}
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
        </Field>

        <Field label="الوصف (اختياري)">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-primary resize-none"
          />
        </Field>

        <Field label="الصورة">
          <ImageInput value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
        </Field>

        <Toggle label="إخفاء من القائمة العامة" value={form.hidden} onChange={(v) => setForm({ ...form, hidden: v })} />
        <Toggle label="عرض في «الأطباق المميزة»" value={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
        <Toggle label="تفعيل الأحجام" value={form.sizesEnabled} onChange={(v) => setForm({ ...form, sizesEnabled: v })} />
        {form.sizesEnabled && (
          <Toggle label="اختيار الحجم إجباري" value={form.requiresSize} onChange={(v) => setForm({ ...form, requiresSize: v })} />
        )}
        <Toggle label="تفعيل اختيار أنواع الحبات" value={form.pieceOptionsEnabled} onChange={(v) => setForm({ ...form, pieceOptionsEnabled: v })} />
        {form.pieceOptionsEnabled && (
          <Toggle label="اختيار أنواع الحبات إجباري" value={form.pieceOptionsRequired} onChange={(v) => setForm({ ...form, pieceOptionsRequired: v })} />
        )}

        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending || !form.name.trim() || !form.categoryId}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg active:scale-[0.99] disabled:opacity-50"
        >
          {saveMut.isPending ? "جاري الحفظ…" : "حفظ"}
        </button>

        {!isNew && itemId && (
          <>
            {form.sizesEnabled && existing && <SizesEditor itemId={itemId} sizes={existing.sizes} />}
            {form.pieceOptionsEnabled && existing && <PieceOptionsEditor itemId={itemId} options={existing.pieceOptions} />}
          </>
        )}
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-card border border-border/40 rounded-xl px-4 py-3">
      <span className="font-bold text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full p-0.5 transition ${value ? "bg-primary" : "bg-muted"}`}
        aria-pressed={value}
      >
        <div className={`w-6 h-6 rounded-full bg-background transition ${value ? "mr-auto" : ""}`} />
      </button>
    </div>
  );
}

function SizesEditor({ itemId, sizes }: { itemId: number; sizes: AdminItemFull["sizes"] }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [n, setN] = useState({ label: "", pieces: "0", price: "" });

  const inv = () => {
    qc.invalidateQueries({ queryKey: ["admin-item", itemId] });
    qc.invalidateQueries({ queryKey: ["public-menu"] });
  };

  const addM = useMutation({
    mutationFn: () =>
      api.post("/admin/sizes", {
        itemId,
        label: n.label,
        pieces: Number(n.pieces || "0"),
        price: Number(n.price || "0"),
      }),
    onSuccess: () => { inv(); setAdding(false); setN({ label: "", pieces: "0", price: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<AdminItemFull["sizes"][number]> }) =>
      api.patch(`/admin/sizes/${id}`, body),
    onSuccess: inv,
  });
  const delM = useMutation({
    mutationFn: (id: number) => api.del(`/admin/sizes/${id}`),
    onSuccess: inv,
  });
  const reM = useMutation({
    mutationFn: (orderedIds: number[]) => api.post("/admin/sizes/reorder", { orderedIds }),
    onSuccess: inv,
  });

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sizes];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx]!, next[swap]!] = [next[swap]!, next[idx]!];
    reM.mutate(next.map((s) => s.id));
  };

  return (
    <section className="mt-6">
      <h2 className="font-bold text-base mb-2 text-primary">الأحجام</h2>
      <div className="space-y-2">
        {sizes.map((s, idx) => (
          <div key={s.id} className="bg-card border border-border/40 rounded-xl p-3 flex items-center gap-2">
            <input
              defaultValue={s.label}
              onBlur={(e) => e.target.value !== s.label && updM.mutate({ id: s.id, body: { label: e.target.value } })}
              className="flex-1 px-2 py-1.5 rounded-md bg-background border border-border text-sm"
            />
            <input
              defaultValue={s.pieces}
              inputMode="numeric"
              onBlur={(e) => updM.mutate({ id: s.id, body: { pieces: Number(e.target.value || "0") } })}
              className="w-16 px-2 py-1.5 rounded-md bg-background border border-border text-sm"
              title="القطع"
            />
            <input
              defaultValue={s.price}
              inputMode="numeric"
              onBlur={(e) => updM.mutate({ id: s.id, body: { price: Number(e.target.value || "0") } })}
              className="w-24 px-2 py-1.5 rounded-md bg-background border border-border text-sm"
              title="السعر"
            />
            <div className="flex flex-col">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-0.5 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === sizes.length - 1} className="p-0.5 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={() => delM.mutate(s.id)} className="p-1.5 text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-2 p-3 bg-card border border-primary/40 rounded-xl space-y-2">
          <input placeholder="اسم الحجم" value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} className="w-full px-3 py-2 rounded bg-background border border-border" />
          <div className="flex gap-2">
            <input placeholder="عدد القطع" inputMode="numeric" value={n.pieces} onChange={(e) => setN({ ...n, pieces: e.target.value.replace(/[^0-9]/g, "") })} className="flex-1 px-3 py-2 rounded bg-background border border-border" />
            <input placeholder="السعر" inputMode="numeric" value={n.price} onChange={(e) => setN({ ...n, price: e.target.value.replace(/[^0-9]/g, "") })} className="flex-1 px-3 py-2 rounded bg-background border border-border" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => addM.mutate()} disabled={!n.label || !n.price} className="flex-1 py-2 rounded bg-primary text-primary-foreground font-bold disabled:opacity-50">حفظ</button>
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded bg-muted font-bold">إلغاء</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full mt-2 py-2 rounded-xl border border-dashed border-primary/50 text-primary font-bold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> إضافة حجم
        </button>
      )}
    </section>
  );
}

function PieceOptionsEditor({ itemId, options }: { itemId: number; options: AdminItemFull["pieceOptions"] }) {
  const qc = useQueryClient();
  const [newLabel, setNewLabel] = useState("");
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["admin-item", itemId] });
    qc.invalidateQueries({ queryKey: ["public-menu"] });
  };
  const addM = useMutation({
    mutationFn: () => api.post("/admin/piece-options", { itemId, label: newLabel }),
    onSuccess: () => { inv(); setNewLabel(""); },
  });
  const updM = useMutation({
    mutationFn: ({ id, label }: { id: number; label: string }) =>
      api.patch(`/admin/piece-options/${id}`, { label }),
    onSuccess: inv,
  });
  const delM = useMutation({
    mutationFn: (id: number) => api.del(`/admin/piece-options/${id}`),
    onSuccess: inv,
  });

  return (
    <section className="mt-6">
      <h2 className="font-bold text-base mb-2 text-primary">أنواع الحبات</h2>
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="bg-card border border-border/40 rounded-xl p-2 flex items-center gap-2">
            <input
              defaultValue={o.label}
              onBlur={(e) => e.target.value !== o.label && updM.mutate({ id: o.id, label: e.target.value })}
              className="flex-1 px-3 py-2 rounded bg-background border border-border"
            />
            <button onClick={() => delM.mutate(o.id)} className="p-2 text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input placeholder="نوع جديد" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="flex-1 px-3 py-2 rounded bg-background border border-border" />
        <button onClick={() => addM.mutate()} disabled={!newLabel.trim()} className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold disabled:opacity-50">إضافة</button>
      </div>
    </section>
  );
}
