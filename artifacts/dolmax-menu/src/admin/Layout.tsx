import { Link, useLocation } from "wouter";
import { ChevronRight, LogOut } from "lucide-react";
import { api } from "./api";
import { useQueryClient } from "@tanstack/react-query";

export function AdminShell({
  title,
  back = "/",
  children,
}: {
  title: string;
  back?: string | null;
  children: React.ReactNode;
}) {
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    qc.clear();
    navigate("/login");
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          {back && (
            <Link href={back}>
              <button className="p-2 rounded-full hover:bg-card active:scale-95 transition" aria-label="رجوع">
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          )}
          <h1 className="flex-1 text-lg font-bold text-primary">{title}</h1>
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-card active:scale-95 transition"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 pt-4 pb-32">{children}</main>
    </div>
  );
}
