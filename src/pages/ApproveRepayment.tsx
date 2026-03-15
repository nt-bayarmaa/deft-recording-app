import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  useRepaymentByApprovalToken,
  useUpdateRepaymentStatus,
  useLoanById,
} from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { formatAmount, formatDate } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/data/notifications";
import { useQueryClient } from "@tanstack/react-query";

export default function ApproveRepayment() {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { toast } = useToast();
  const {
    data: repayment,
    isLoading,
    error,
    refetch,
  } = useRepaymentByApprovalToken(token ?? null);
  const { data: loan } = useLoanById(repayment?.loanId ?? null);
  const updateStatus = useUpdateRepaymentStatus();
  const qc = useQueryClient();

  const isLender = loan && appUser && loan.lenderId === appUser.id;
  const borrowerName = repayment?.personName ?? "—";

  const handleAction = (status: "completed" | "rejected") => {
    if (!repayment || !appUser || !loan) return;

    updateStatus.mutate(
      { id: repayment.id, status, approvedBy: appUser.id },
      {
        onSuccess: async () => {
          refetch();
          qc.invalidateQueries({ queryKey: ["repayments"] });
          qc.invalidateQueries({ queryKey: ["balances"] });
          qc.invalidateQueries({ queryKey: ["notifications"] });
          if (repayment.createdBy) {
            const lenderName =
              appUser?.nickname || appUser?.username || appUser?.userCode || "Хэрэглэгч";
            try {
              await createNotification({
                userId: repayment.createdBy,
                type: "repayment_approved",
                relatedRepaymentId: repayment.id,
                relatedLoanId: loan.id,
                message:
                  status === "completed"
                    ? `${lenderName} таны төлбөрийг зөвшөөрлөө`
                    : `${lenderName} таны төлбөрийг татгалзлаа`,
                amount: repayment.amount,
                currency: repayment.currency,
                personName: lenderName,
              });
            } catch (e) {
              console.error("[ApproveRepayment] createNotification failed:", e);
            }
          }
          navigate("/", { replace: true });
        },
        onError: (err) =>
          toast({
            title: "Алдаа",
            description: (err as Error).message,
            variant: "destructive",
          }),
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !repayment) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <h1 className="text-2xl font-semibold">Төлбөр олдсонгүй</h1>
            <p className="text-muted-foreground text-sm">
              Холбоос буруу эсвэл хугацаа дууссан байна.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!loan) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isLender) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <h1 className="text-2xl font-semibold">Эрх байхгүй</h1>
            <p className="text-muted-foreground text-sm">
              Зөвхөн зээл өгсөн хүн төлбөрийг зөвшөөрч болно.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isAlreadyActioned =
    repayment.status === "completed" || repayment.status === "rejected";

  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-2xl font-semibold">
            Та {borrowerName}-с төлбөр хүлээн авснаа баталгаажуулна уу
          </h1>

          <div className="rounded-2xl border border-border p-5 bg-card space-y-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Төлбөр төлсөн хүн (зээл авсан хүн)
                </span>
                <span className="font-medium">{borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Төлбөрийн дүн</span>
                <span className="font-semibold tabular-nums">
                  {formatAmount(repayment.amount, repayment.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Төлсөн өдөр</span>
                <span>{formatDate(repayment.repaymentDate)}</span>
              </div>
              {repayment.memo && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Тэмдэглэл</span>
                  <span className="text-right max-w-[60%]">{repayment.memo}</span>
                </div>
              )}
            </div>
          </div>

          {isAlreadyActioned ? (
            <div
              className={`rounded-xl border p-4 ${
                repayment.status === "completed"
                  ? "border-positive/30 bg-positive-light text-positive"
                  : "border-negative/30 bg-negative-light text-negative"
              }`}
            >
              <p className="font-medium">
                {repayment.status === "completed" ? "Зөвшөөрсөн" : "Татгалзсан"}
              </p>
              <p className="text-sm mt-1">
                {repayment.status === "completed"
                  ? `${borrowerName}-с ${formatAmount(repayment.amount, repayment.currency)} төлбөр хүлээн авлаа.`
                  : "Төлбөрийг татгалзлаа."}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction("completed")}
                disabled={updateStatus.isPending}
                className="flex-1 h-12 rounded-xl bg-foreground text-background font-medium hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Зөвшөөрөх
              </button>
              <button
                onClick={() => handleAction("rejected")}
                disabled={updateStatus.isPending}
                className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Татгалзах
              </button>
            </div>
          )}

          {isAlreadyActioned && (
            <button
              onClick={() => navigate("/")}
              className="w-full h-12 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
            >
              Нүүр хуудас руу
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
