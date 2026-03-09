import { useParams, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useState } from "react";

export default function ApproveLoan() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold">Зээл зөвшөөрөх</h1>
        <p className="text-muted-foreground text-sm">
          {id && token
            ? "Хүлээн авагч таныг зээл зөвшөөрөхийг хүсч байна."
            : "Холбоос буруу байна."}
        </p>
        {id && token && status === "idle" && (
          <button
            onClick={() => setStatus("success")}
            className="w-full bg-foreground text-background py-3.5 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Зөвшөөрөх
          </button>
        )}
        {status === "success" && (
          <div className="rounded-xl border border-positive/30 bg-positive-light p-4 text-positive">
            <p className="font-medium">Зөвшөөрсөн</p>
            <p className="text-sm mt-1">Зээл амжилттай зөвшөөрөгдлөө.</p>
          </div>
        )}
      </div>
    </div>
  );
}
