import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadImage, imageSrc } from "./api";
import { toast } from "sonner";

export function ImageInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const path = await uploadImage(file);
      onChange(path);
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
              onClick={() => onChange(null)}
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
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <input
        type="text"
        placeholder="أو ألصق رابط صورة"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-primary text-sm"
      />
    </div>
  );
}
