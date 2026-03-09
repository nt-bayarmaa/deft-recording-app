import { AppLayout } from "@/components/AppLayout";
import { QrCode } from "lucide-react";

export default function Scan() {
  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center">QR уншуулах</h1>
        <div className="text-center py-16 space-y-4">
          <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
            <QrCode className="w-16 h-16 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground">
            QR код уншуулах боломж удахгүй нэмэгдэнэ
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
