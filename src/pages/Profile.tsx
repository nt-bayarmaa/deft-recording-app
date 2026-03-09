import { Copy, Share2, LogOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";

const mockProfile = {
  username: "Бат-Эрдэнэ",
  email: "bat@example.com",
  userCode: "USR-A1B2C3",
};

export default function Profile() {
  const handleCopy = () => {
    navigator.clipboard.writeText(mockProfile.userCode);
    toast.success("ID хуулагдлаа");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: `Миний Өр.mn ID: ${mockProfile.userCode}` });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center">Профайл</h1>

        <div className="rounded-2xl border border-border p-6 bg-card space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mx-auto">
            {mockProfile.username[0]}
          </div>
          <div>
            <p className="text-lg font-semibold">{mockProfile.username}</p>
            <p className="text-sm text-muted-foreground">{mockProfile.email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Хэрэглэгчийн ID</p>
            <p className="text-lg font-mono font-semibold tracking-wider">{mockProfile.userCode}</p>
          </div>

          <div className="flex justify-center p-4 bg-muted/30 rounded-xl">
            <QRCodeSVG value={mockProfile.userCode} size={140} level="H" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              Хуулах
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Хуваалцах
            </button>
          </div>
        </div>

        <button className="w-full h-12 rounded-xl border border-border text-sm font-medium hover:bg-negative-light hover:text-negative transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Гарах
        </button>
      </div>
    </AppLayout>
  );
}
