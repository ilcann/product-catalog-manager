import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB — localStorage sınırı

/**
 * Belge yükleme butonu. Dosyayı okuyup data URL olarak döner
 * (backend/storage bağlanınca burası gerçek yükleme yapacak).
 * Durumlar: boşta → yükleniyor → yüklendi.
 */
export function UploadDocButton({
  onUploaded,
}: {
  onUploaded: (url: string, fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error("Dosya çok büyük", {
        description: "Şimdilik en fazla 2 MB yükleyebilirsiniz.",
      });
      return;
    }
    setState("uploading");
    const promise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("okunamadı"));
      reader.readAsDataURL(file);
    });
    toast.promise(promise, {
      loading: `"${file.name}" yükleniyor…`,
      success: `"${file.name}" yüklendi.`,
      error: `"${file.name}" yüklenemedi.`,
    });
    promise
      .then((url) => {
        onUploaded(url, file.name);
        setState("done");
        setTimeout(() => setState("idle"), 2000);
      })
      .catch(() => setState("idle"));
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant={state === "done" ? "default" : "outline"}
        size="icon"
        aria-label="Belge yükle"
        title="Belge yükle"
        disabled={state === "uploading"}
        onClick={() => inputRef.current?.click()}
      >
        {state === "uploading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : state === "done" ? (
          <Check className="size-4" />
        ) : (
          <Upload className="size-4" />
        )}
      </Button>
    </>
  );
}
