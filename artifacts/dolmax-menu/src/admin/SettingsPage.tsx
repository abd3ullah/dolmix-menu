import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { AdminShell } from "./Layout";
import { toast } from "sonner";

type Settings = {
  restaurant_name?: string;
  whatsapp_number?: string;
  phone_number?: string;
};

export function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<Settings>("/admin/settings"),
  });
  const [form, setForm] = useState<Settings>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const saveMut = useMutation({
    mutationFn: () => api.put("/admin/settings", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
      toast.success("تم الحفظ");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="الإعدادات">
      <div className="space-y-4">
        <Field label="اسم المطعم">
          <input
            value={form.restaurant_name ?? ""}
            onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
        </Field>
        <Field label="رقم واتساب (مع رمز الدولة، بدون +)">
          <input
            inputMode="tel"
            value={form.whatsapp_number ?? ""}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value.replace(/[^0-9]/g, "") })}
            placeholder="9647719461693"
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
        </Field>
        <Field label="رقم الهاتف للاتصال">
          <input
            inputMode="tel"
            value={form.phone_number ?? ""}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            placeholder="07719461693"
            className="w-full px-3 py-3 rounded-lg bg-background border border-border outline-none focus:border-primary"
          />
        </Field>
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
        >
          {saveMut.isPending ? "جاري الحفظ…" : "حفظ"}
        </button>
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
