import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import { useLoanByApprovalToken, useUpdateLoanStatus } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { formatAmount, formatDate } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { updateLoanBorrower } from "@/data/loans";
import { addFriend, deleteShadowUser, getUserById } from "@/data/users";
import { useQueryClient } from "@tanstack/react-query";

export default function ApproveLoan() {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { toast } = useToast();
  const { data: loan, isLoading, error, refetch } = useLoanByApprovalToken(token ?? null);
  const updateStatus = useUpdateLoanStatus();
  const qc = useQueryClient();

  const handleAction = async (status: "completed" | "rejected") => {
    if (!loan || !appUser) return;

    try {
      // Check if borrower is a shadow user and merge if needed
      if (status === "completed") {
        const borrower = await getUserById(loan.borrowerId);
        if (borrower && !borrower.authUserId && borrower.id !== appUser.id) {
          // Shadow user merge: update loan borrower to current user
          await updateLoanBorrower(loan.id, appUser.id);
          // Add friend relationship (lender <-> current user)
          await addFriend(loan.lenderId, appUser.id);
          await addFriend(appUser.id, loan.lenderId);
          // Delete shadow user
          await deleteShadowUser(borrower.id);
        }
      }

      updateStatus.mutate(
        { id: loan.id, status, approvedBy: appUser.id },
        {
          onSuccess: () => {
            refetch();
            qc.invalidateQueries({ queryKey: ["loans"] });
            qc.invalidateQueries({ queryKey: ["balances"] });
            qc.invalidateQueries({ queryKey: ["friends"] });
          },
          onError: (err) =>
            toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" }),
        }
      );
    } catch (err) {
      toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" });
    }
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

  const isAlreadyActioned = loan.status === "completed" || loan.status === "rejected";

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
            loan.status === "completed"
              ? "border-positive/30 bg-positive-light text-positive"
              : "border-negative/30 bg-negative-light text-negative"
          }`}>
            <p className="font-medium">
              {loan.status === "completed" ? "Зөвшөөрсөн" : "Татгалзсан"}
            </p>
            <p className="text-sm mt-1">
              {loan.status === "completed"
                ? "Зээл амжилттай зөвшөөрөгдлөө."
                : "Зээлийг татгалзлаа."}
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
  );
}
