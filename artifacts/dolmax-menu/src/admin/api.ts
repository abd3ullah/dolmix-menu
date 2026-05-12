async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) msg = j.error;
    } catch {}
    const err = new Error(msg) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export type AdminCategory = {
  id: number;
  slug: string;
  nameAr: string;
  displayOrder: number;
  hidden: boolean;
};

export type AdminItem = {
  id: number;
  legacyId: string | null;
  categoryId: number;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  displayOrder: number;
  hidden: boolean;
  sizesEnabled: boolean;
  requiresSize: boolean;
  pieceOptionsEnabled: boolean;
  pieceOptionsRequired: boolean;
};

export type AdminSize = {
  id: number;
  itemId: number;
  legacyId: string | null;
  label: string;
  pieces: number;
  price: number;
  displayOrder: number;
};

export type AdminPieceOption = {
  id: number;
  itemId: number;
  label: string;
  displayOrder: number;
};

export type AdminItemFull = AdminItem & {
  sizes: AdminSize[];
  pieceOptions: AdminPieceOption[];
};

export function imageSrc(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/objects/")) return `/api/storage${url}`;
  return url;
}

export async function uploadImage(file: File): Promise<string> {
  const presign = await api.post<{ uploadURL: string; objectPath: string }>(
    "/storage/uploads/request-url",
    { name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }
  );
  const put = await fetch(presign.uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error("فشل رفع الصورة");
  return presign.objectPath;
}
