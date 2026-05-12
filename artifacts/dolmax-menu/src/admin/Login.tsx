import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { toast } from "sonner";

export function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/login", { username, password });
      qc.invalidateQueries({ queryKey: ["admin-me"] });
      toast.success("تم تسجيل الدخول");
      navigate("/admin");
    } catch (err) {
      toast.error((err as Error).message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border/40 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <p className="text-3xl font-extrabold text-primary tracking-wide">DOLMIX</p>
          <p className="text-sm text-muted-foreground mt-1">لوحة تحكم المطعم</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">اسم المستخدم</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">كلمة المرور</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.99] transition disabled:opacity-50"
          >
            {loading ? "جاري الدخول…" : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
