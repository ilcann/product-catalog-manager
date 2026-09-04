import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Link2, Check, MessageCircle, Instagram, Download } from "lucide-react";

interface ShareProductProps {
  productName: string;
  productCode: string;
}

type ShareTab = "link" | "qr";

export function ShareProduct({ productName, productCode }: ShareProductProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ShareTab>("link");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${productName} (${productCode}) — Nordveka Dijital Ürün Kimliği`;

  useEffect(() => {
    if (!open || !shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 480,
      margin: 1,
      color: { dark: "#1c1917", light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [open, shareUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Bağlantı panoya kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Bağlantı kopyalanamadı.");
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${productCode}-qr.png`;
    a.click();
    toast.success("QR kodu indirildi.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="justify-center sm:gap-1.5">
          <Share2 className="size-4 shrink-0" />
          <span className="hidden sm:inline">Paylaş</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürünü Paylaş</DialogTitle>
          <DialogDescription>
            {productName} · {productCode}
          </DialogDescription>
        </DialogHeader>

        {/* Segmented tab control */}
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("link")}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              tab === "link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="size-4" />
            Bağlantı
          </button>
          <button
            type="button"
            onClick={() => setTab("qr")}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              tab === "qr" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Share2 className="size-4" />
            QR Kod
          </button>
        </div>

        {/* Tab content */}
        {tab === "link" ? (
          <div className="flex min-w-0 flex-col gap-4">
            <button
              type="button"
              onClick={copyLink}
              className="min-w-0 rounded-md border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="tech-label text-muted-foreground">Ürün bağlantısı</span>

                {copied ? (
                  <Check className="size-4 shrink-0 text-green-600" />
                ) : (
                  <Link2 className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>

              <p className="mt-1 break-all text-sm font-medium text-foreground">{shareUrl}</p>
            </button>

            <div className="flex w-full flex-col gap-2">
              <Button asChild variant="outline" className="w-full gap-2">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  await copyLink();
                  window.open("https://www.instagram.com/", "_blank");
                  toast.message("Bağlantı kopyalandı — Instagram hikayenize veya mesajınıza yapıştırın.");
                }}
              >
                <Instagram className="size-4" />
                Instagram
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-xs text-muted-foreground">
              QR kodu okutarak ürün sayfasını açabilir veya indirip baskı materyallerinde kullanabilirsiniz.
            </p>
            <div className="rounded-md border border-border bg-white p-3">
              {qrUrl ? (
                <img src={qrUrl} alt={`${productName} QR kodu`} className="size-48 sm:size-56" />
              ) : (
                <div className="flex size-48 items-center justify-center text-xs text-muted-foreground sm:size-56">
                  QR oluşturuluyor…
                </div>
              )}
            </div>
            <Button variant="default" className="gap-2" onClick={downloadQr} disabled={!qrUrl}>
              <Download className="size-4" />
              QR İndir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
