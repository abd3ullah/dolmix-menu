import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadImage, imageSrc } from "./api";
import { toast } from "sonner";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isLikelyImageUrl(value: string): boolean {
  if (!value) return false;
  // accept our own object-storage paths
  if (value.startsWith("/objects/") || value.startsWith("/api/storage/")) return true;
  try {
    const u = new URL(value);
    if (!/^https?:$/.test(u.protocol)) return false;
    return /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(u.pathname);
  } catch {
    return false;
  }
}

export function ImageInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState(value ?? "");
  const [pasteError, setPasteError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("الحد الأقصى للصورة 5 ميغابايت");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadImage(file);
      onChange(path);
      setPasted(path);
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error((e as Error).message || "فشل رفع الصورة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img
              src={imageSrc(value)}
              alt="معاينة"
              className="w-20 h-20 rounded-lg object-cover bg-muted border border-border"
            />
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setPasted("");
                setPasteError(null);
              }}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              aria-label="إزالة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
            لا توجد صورة
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex-1 py-3 rounded-lg bg-card border border-border hover:border-primary flex items-center justify-center gap-2 font-bold disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {busy ? "جاري الرفع…" : value ? "تغيير الصورة" : "رفع صورة"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <input
        type="text"
        placeholder="أو ألصق رابط صورة (https://… .jpg/.png/.webp)"
        value={pasted}
        onChange={(e) => {
          const v = e.target.value;
          setPasted(v);
          if (!v) {
            onChange(null);
            setPasteError(null);
            return;
          }
          if (isLikelyImageUrl(v)) {
            setPasteError(null);
            onChange(v);
          } else {
            setPasteError("الرابط لا يبدو صورة صحيحة");
          }
        }}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-primary text-sm"
      />
      {pasteError && <p className="text-xs text-destructive">{pasteError}</p>}
    </div>
  );
}
