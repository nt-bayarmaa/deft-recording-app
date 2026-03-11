import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Mail, Share2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { formatAmount } from "@/data/mock";

interface LoanSuccessModalProps {
  open: boolean;
  onClose: () => void;
  approvalToken: string;
  amount: number;
  currency: string;
  personName: string;
}

export function LoanSuccessModal({
  open,
  onClose,
  approvalToken,
  amount,
  currency,
  personName,
}: LoanSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const approveLink = `${window.location.origin}/approve/${approvalToken}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(approveLink);
    setCopied(true);
    toast.success("Холбоос хуулагдлаа");
    setTimeout(() => setCopied(false), 2000);
  }, [approveLink]);

  const handleDownloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `loan-approval-${approvalToken.slice(0, 8)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [approvalToken]);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent("Зээл зөвшөөрөх - Өр.mn");
    const body = encodeURIComponent(
      `Сайн байна уу,\n\nТа доорх холбоосоор зээлийг зөвшөөрнө үү:\n${approveLink}\n\nДүн: ${formatAmount(amount, currency)}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [approveLink, amount, currency]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Зээл зөвшөөрөх - Өр.mn",
          text: `Зээл зөвшөөрөх холбоос: ${formatAmount(amount, currency)}`,
          url: approveLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }, [approveLink, amount, currency, handleCopy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Зээл үүсгэгдлээ ✅</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold tabular-nums">
              {formatAmount(amount, currency)}
            </p>
            <p className="text-sm text-muted-foreground">{personName}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium text-center">
              Зөвшөөрөх холбоос
            </p>
            <div ref={qrRef} className="flex justify-center p-4 bg-muted/30 rounded-xl">
              <QRCodeSVG value={approveLink} size={160} level="H" />
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground break-all font-mono">
              {approveLink}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Хуулсан" : "Холбоос хуулах"}
            </button>
            <button
              onClick={handleDownloadQR}
              className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              QR татах
            </button>
            <button
              onClick={handleEmail}
              className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              И-мэйл
            </button>
            <button
              onClick={handleShare}
              className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Хуваалцах
            </button>
          </div>
        </div>

        <div className="p-5 border-t border-border">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
          >
            Дууслаа
          </button>
        </div>
      </div>
    </div>
  );
}
