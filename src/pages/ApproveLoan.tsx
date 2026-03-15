import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  useLoanByApprovalToken,
  useUpdateLoanStatus,
  useUserById,
  useTransactionByLoanId,
} from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import {
  formatAmount,
  formatDate,
  getBankLabel,
  formatAccountNumber,
} from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { replaceShadowInLoans } from "@/data/loans";
import {
  addFriend,
  deleteShadowUser,
  getUserById,
  removeFriendLinksToShadow,
} from "@/data/users";
import { useQueryClient } from "@tanstack/react-query";

export default function ApproveLoan() {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { toast } = useToast();
  const {
    data: loan,
    isLoading,
    error,
    refetch,
  } = useLoanByApprovalToken(token ?? null);
  // Эсрэг талын хүн: user borrower бол lender, user lender бол borrower (shadow эсвэл бодит)
  const counterpartyId =
    loan && appUser
      ? loan.lenderId === appUser.id
        ? loan.borrowerId
        : loan.lenderId
      : null;
  const { data: counterparty } = useUserById(counterpartyId);
  const { data: lender } = useUserById(loan?.lenderId ?? null);
  const { data: transaction } = useTransactionByLoanId(loan?.id ?? null);
  const updateStatus = useUpdateLoanStatus();
  const qc = useQueryClient();

  const counterpartyName =
    (counterparty?.nickname ||
      counterparty?.username ||
      counterparty?.userCode ||
      counterpartyId?.slice(0, 8)) ??
    "—";
  const lenderName =
    (lender?.nickname ||
      lender?.username ||
      lender?.userCode ||
      loan?.lenderId?.slice(0, 8)) ??
    "—";
  const isLender = loan && appUser && loan.lenderId === appUser.id;
  const lenderEmail = lender?.email ?? "";
  const borrowerEmail = counterparty?.email ?? "";
  const displayEmail = isLender ? borrowerEmail : lenderEmail;
  const emailLabel = isLender ? "Зээл авсан хүний и-мэйл" : "Зээл өгсөн хүний и-мэйл";

  const handleAction = async (status: "completed" | "rejected") => {
    if (!loan || !appUser) return;

    try {
      // Check if borrower or lender is a shadow user and merge if needed
      if (status === "completed") {
        const borrower = await getUserById(loan.borrowerId);
        const lenderUser = await getUserById(loan.lenderId);

        // Borrower is shadow (зээл өгөх: borrower clicks approval link)
        if (borrower && !borrower.authUserId && borrower.id !== appUser.id) {
          await replaceShadowInLoans(borrower.id, appUser.id);
          await removeFriendLinksToShadow(borrower.id);
          await addFriend(loan.lenderId, appUser.id, borrower.username);
          await addFriend(appUser.id, loan.lenderId);
          await deleteShadowUser(borrower.id);
        }
        // Lender is shadow (зээл авах: lender clicks approval link)
        else if (lenderUser && !lenderUser.authUserId && lenderUser.id !== appUser.id) {
          await replaceShadowInLoans(lenderUser.id, appUser.id);
          await removeFriendLinksToShadow(lenderUser.id);
          await addFriend(loan.borrowerId, appUser.id, lenderUser.username);
          await addFriend(appUser.id, loan.borrowerId);
          await deleteShadowUser(lenderUser.id);
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
            toast({
              title: "Алдаа",
              description: (err as Error).message,
              variant: "destructive",
            }),
        },
      );
    } catch (err) {
      toast({
        title: "Алдаа",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
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

  if (error || !loan) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <h1 className="text-2xl font-semibold">Зээл олдсонгүй</h1>
            <p className="text-muted-foreground text-sm">
              Холбоос буруу эсвэл хугацаа дууссан байна.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isAlreadyActioned =
    loan.status === "completed" || loan.status === "rejected";

  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-2xl font-semibold">
            {isLender ? "Зээл өгөх зөвшөөрөх" : "Зээл авах зөвшөөрөх"}
          </h1>

          <div className="rounded-2xl border border-border p-5 bg-card space-y-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isLender ? "Хэнд зээл өгч байна" : "Хэнээс ирсэн"}
                </span>
                <span className="font-medium">
                  {isLender ? counterpartyName : lenderName}
                </span>
              </div>
              {displayEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{emailLabel}</span>
                  <span
                    className="text-right max-w-[60%] truncate"
                    title={displayEmail}
                  >
                    {displayEmail}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Зээл дүн</span>
                <span className="font-semibold tabular-nums">
                  {formatAmount(loan.amount, loan.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Зээлсэн өдөр</span>
                <span>{formatDate(loan.loanDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Төлөх өдөр</span>
                <span>{formatDate(loan.dueDate)}</span>
              </div>
              {loan.memo && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">
                    Тэмдэглэл
                  </span>
                  <span className="text-right max-w-[60%]">{loan.memo}</span>
                </div>
              )}
              {(transaction?.senderBank || transaction?.senderAccount) && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">
                    Зээл илгээсэн данс
                  </span>
                  <span className="text-right tabular-nums">
                    {transaction.senderBank &&
                      getBankLabel(transaction.senderBank)}
                    {transaction.senderAccount &&
                      ` ${formatAccountNumber(transaction.senderAccount)}`}
                  </span>
                </div>
              )}
              {(transaction?.recipientBank ||
                transaction?.recipientAccount) && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">
                    Зээл хүлээн авсан данс
                  </span>
                  <span className="text-right tabular-nums">
                    {transaction.recipientBank &&
                      getBankLabel(transaction.recipientBank)}
                    {transaction.recipientAccount &&
                      ` ${formatAccountNumber(transaction.recipientAccount)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isAlreadyActioned ? (
            <div
              className={`rounded-xl border p-4 ${
                loan.status === "completed"
                  ? "border-positive/30 bg-positive-light text-positive"
                  : "border-negative/30 bg-negative-light text-negative"
              }`}
            >
              <p className="font-medium">
                {loan.status === "completed" ? "Зөвшөөрсөн" : "Татгалзсан"}
              </p>
              <p className="text-sm mt-1">
                {loan.status === "completed"
                  ? isLender
                    ? `${counterpartyName}-д ${formatAmount(loan.amount, loan.currency)} зээл өгөв.`
                    : `${lenderName}-с ${formatAmount(loan.amount, loan.currency)} зээл авав.`
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
    </AppLayout>
  );
}
