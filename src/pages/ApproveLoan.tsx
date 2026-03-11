import { useParams } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLoanByApprovalToken, useUpdateLoanStatus, useContacts } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { formatAmount, formatDate } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";

export default function ApproveLoan() {
  const { id: token } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { toast } = useToast();
  const { data: loan, isLoading, error } = useLoanByApprovalToken(token ?? null);
  const updateStatus = useUpdateLoanStatus();
  const currentUserId = session?.user?.id ?? "";

  const handleAction = (status: "approved" | "rejected") => {
    if (!loan) return;
    updateStatus.mutate(
      { id: loan.id, status, approvedBy: currentUserId },
      {
        onError: (err) =>
          toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-semibold">Зээл олдсонгүй</h1>
          <p className="text-muted-foreground text-sm">
            Холбоос буруу эсвэл хугацаа дууссан байна.
          </p>
        </div>
      </div>
    );
  }

  const isAlreadyActioned = loan.status === "approved" || loan.status === "rejected";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-semibold">Зээл зөвшөөрөх</h1>

        <div className="rounded-2xl border border-border p-5 bg-card space-y-4 text-left">
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums">
              {formatAmount(loan.amount, loan.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loan.type === "give" ? "Зээл өгөх" : "Зээл авах"}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Зээлсэн өдөр</span>
              <span>{formatDate(loan.loanDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Төлөх өдөр</span>
              <span>{formatDate(loan.dueDate)}</span>
            </div>
            {loan.memo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тэмдэглэл</span>
                <span className="text-right max-w-[60%]">{loan.memo}</span>
              </div>
            )}
          </div>
        </div>

        {isAlreadyActioned ? (
          <div className={`rounded-xl border p-4 ${
            loan.status === "approved"
              ? "border-positive/30 bg-positive-light text-positive"
              : "border-negative/30 bg-negative-light text-negative"
          }`}>
            <p className="font-medium">
              {loan.status === "approved" ? "Зөвшөөрсөн" : "Татгалзсан"}
            </p>
            <p className="text-sm mt-1">
              {loan.status === "approved"
                ? "Зээл амжилттай зөвшөөрөгдлөө."
                : "Зээлийг татгалзлаа."}
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("approved")}
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
      </div>
    </div>
  );
}
