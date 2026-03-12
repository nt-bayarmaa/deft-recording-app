import { Copy, Share2, LogOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";

export default function Profile() {
  const { session, appUser } = useAuth();
  const navigate = useNavigate();
  const email = session?.user?.email ?? "";
  const displayName = appUser?.nickname || appUser?.username || email.split("@")[0];
  const userCode = appUser?.userCode ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(userCode);
    toast.success("Код хуулагдлаа");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: `Миний Өр.mn код: ${userCode}` });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center">Профайл</h1>

        <div className="rounded-2xl border border-border p-6 bg-card space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mx-auto">
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Хэрэглэгчийн код</p>
            <p className="text-lg font-mono font-bold tracking-widest">{userCode}</p>
          </div>

          <div className="flex justify-center p-4 bg-muted/30 rounded-xl">
            <QRCodeSVG value={userCode} size={140} level="H" />
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

        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-border text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Гарах
        </button>
      </div>
    </AppLayout>
  );
}
