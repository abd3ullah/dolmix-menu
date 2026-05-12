import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "./api";
import { AdminLogin } from "./Login";
import { AdminDashboard } from "./Dashboard";
import { CategoriesPage } from "./CategoriesPage";
import { ItemsPage } from "./ItemsPage";
import { ItemEditPage } from "./ItemEditPage";
import { SettingsPage } from "./SettingsPage";
import { ImagesPage } from "./ImagesPage";

function useAuth() {
  return useQuery({
    queryKey: ["admin-me"],
    queryFn: () => api.get<{ isAdmin: boolean; username?: string }>("/auth/me"),
    staleTime: 60_000,
    retry: false,
  });
}

function Protected({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && data && !data.isAdmin) navigate("/admin/login");
  }, [data, isLoading, navigate]);

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">
        جاري التحميل…
      </div>
    );
  }
  if (!data?.isAdmin) return null;
  return <>{children}</>;
}

export function AdminApp() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <Protected><AdminDashboard /></Protected>
      </Route>
      <Route path="/admin/categories">
        <Protected><CategoriesPage /></Protected>
      </Route>
      <Route path="/admin/items">
        <Protected><ItemsPage /></Protected>
      </Route>
      <Route path="/admin/items/new">
        <Protected><ItemEditPage /></Protected>
      </Route>
      <Route path="/admin/items/:id">
        <Protected><ItemEditPage /></Protected>
      </Route>
      <Route path="/admin/images">
        <Protected><ImagesPage /></Protected>
      </Route>
      <Route path="/admin/settings">
        <Protected><SettingsPage /></Protected>
      </Route>
    </Switch>
  );
}
