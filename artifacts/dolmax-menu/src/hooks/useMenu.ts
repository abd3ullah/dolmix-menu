import { useQuery } from "@tanstack/react-query";
import type { MenuItem } from "../data/menuData";

export type MenuCategoryDTO = { id: string; label: string };

export type MenuPayload = {
  categories: MenuCategoryDTO[];
  items: MenuItem[];
  settings: Record<string, unknown>;
};

export function useMenu() {
  return useQuery<MenuPayload>({
    queryKey: ["public-menu"],
    queryFn: async () => {
      const r = await fetch("/api/menu", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load menu");
      return r.json();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
