import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoans, useUpdateLoanStatus, useFriends, usePendingRepaymentsForLender, useUpdateRepaymentStatus } from "@/hooks/useQueries";
import { getFriendDisplayName } from "@/data/users";
import { formatAmount, formatDate } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Check, X, Clock, Send, Wallet } from "lucide-react";

export default function Approvals() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { data: loans = [], isLoading, error } = useLoans();
  const { data: friends = [] } = useFriends();
  const { data: pendingRepayments = [], isLoading: repaymentsLoading, error: repaymentsError } = usePendingRepaymentsForLender();
  const updateStatus = useUpdateLoanStatus();
  const updateRepaymentStatus = useUpdateRepaymentStatus();
  const { toast } = useToast();

  const currentUserId = appUser?.id ?? "";

  const nameMap = new Map<string, string>();
  for (const f of friends) {
    nameMap.set(f.friendId, getFriendDisplayName(f.nickname, f.friend));
  }

  const getOtherName = (loan: (typeof loans)[0]) => {
    const isLender = loan.lenderId === currentUserId;
    const otherId = isLender ? loan.borrowerId : loan.lenderId;
    return nameMap.get(otherId) ?? otherId.slice(0, 8);
  };

  const isPending = (status: string) =>
    status === "pending_borrower_approval" || status === "pending";

  const sentLoans = loans.filter((l) => l.lenderId === currentUserId);
  const pendingLoans = loans.filter(
    (l) => l.borrowerId === currentUserId && isPending(l.status),
  );

  const handleLoanAction = (id: string, status: "completed" | "rejected") => {
    updateStatus.mutate(
      { id, status, approvedBy: currentUserId },
      {
        onError: (err) =>
          toast({
            title: "Алдаа",
            description: (err as Error).message,
            variant: "destructive",
          }),
      },
    );
  };

  const handleRepaymentAction = (repayment: (typeof pendingRepayments)[0], status: "completed" | "rejected") => {
    if (!repayment.approvalToken) return;
    updateRepaymentStatus.mutate(
      { id: repayment.id, status, approvedBy: currentUserId },
      {
        onSuccess: () => {
          if (status === "completed") {
            toast({ title: "Зөвшөөрөгдлөө", description: "Төлбөр амжилттай баталгаажлаа." });
          }
        },
        onError: (err) =>
          toast({
            title: "Алдаа",
            description: (err as Error).message,
            variant: "destructive",
          }),
      },
    );
  };

  const handleRepaymentView = (repayment: (typeof pendingRepayments)[0]) => {
    if (repayment.approvalToken) {
      navigate(`/repayment/approve/${repayment.approvalToken}`);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "completed") return "Зөвшөөрсөн";
    if (status === "rejected") return "Татгалзсан";
    return "Хүлээж байна";
  };

  const renderLoanCard = (loan: (typeof loans)[0], showActions: boolean) => {
    const otherName = getOtherName(loan);
    return (
      <div
        key={loan.id}
        className="rounded-2xl border border-border p-4 bg-card space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
              {otherName[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{otherName}</p>
              <p className="text-xs text-muted-foreground">
                {loan.type === "give" ? "Зээл өгөх" : "Зээл авах"} ·{" "}
                {formatDate(loan.loanDate)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              loan.type === "give" ? "text-positive" : "text-negative",
            )}
          >
            {formatAmount(loan.amount, loan.currency)}
          </span>
        </div>
        {loan.memo && (
          <p className="text-xs text-muted-foreground">{loan.memo}</p>
        )}
        {showActions ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleLoanAction(loan.id, "completed")}
              disabled={updateStatus.isPending}
              className="flex-1 h-10 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Зөвшөөрөх
            </button>
            <button
              onClick={() => handleLoanAction(loan.id, "rejected")}
              disabled={updateStatus.isPending}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Татгалзах
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-xl border p-3 text-sm",
              loan.status === "completed" &&
                "border-positive/30 bg-positive-light text-positive",
              loan.status === "rejected" &&
                "border-negative/30 bg-negative-light text-negative",
              isPending(loan.status) &&
                "border-muted bg-muted/30 text-muted-foreground",
            )}
          >
            <span className="font-medium">{getStatusLabel(loan.status)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <Tabs defaultValue="sent" className="w-full">
          <TabsList variant="line" className="w-full justify-start flex-wrap h-auto gap-1">
            <TabsTrigger variant="line" value="sent" className="gap-1.5">
              <Send className="w-4 h-4" />
              Миний илгээсэн
            </TabsTrigger>
            <TabsTrigger variant="line" value="pending" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Зөвшөөрөх хүлээж буй
            </TabsTrigger>
            <TabsTrigger variant="line" value="repayments" className="gap-1.5">
              <Wallet className="w-4 h-4" />
              Төлбөр баталгаажуулах
              {pendingRepayments.length > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-foreground text-background text-xs flex items-center justify-center">
                  {pendingRepayments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-6">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border p-4 h-32 bg-muted"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-destructive space-y-2">
                <p className="text-sm">Алдаа гарлаа</p>
                <p className="text-xs text-muted-foreground">
                  {(error as Error).message}
                </p>
              </div>
            ) : sentLoans.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Илгээсэн зээл байхгүй</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentLoans.map((loan) => renderLoanCard(loan, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border p-4 h-32 bg-muted"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-destructive space-y-2">
                <p className="text-sm">Алдаа гарлаа</p>
                <p className="text-xs text-muted-foreground">
                  {(error as Error).message}
                </p>
              </div>
            ) : pendingLoans.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Хүлээгдэж буй хүсэлт байхгүй</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLoans.map((loan) => renderLoanCard(loan, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="repayments" className="mt-6">
            {repaymentsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border p-4 h-32 bg-muted"
                  />
                ))}
              </div>
            ) : repaymentsError ? (
              <div className="text-center py-16 text-destructive space-y-2">
                <p className="text-sm">Алдаа гарлаа</p>
                <p className="text-xs text-muted-foreground">
                  {(repaymentsError as Error).message}
                </p>
              </div>
            ) : pendingRepayments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Төлбөр баталгаажуулах хүсэлт байхгүй</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRepayments.map((repayment) => (
                  <div
                    key={repayment.id}
                    className="rounded-2xl border border-border p-4 bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {repayment.personName[0] || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {repayment.personName} төлбөр төлсөн гэж баталгаажуулж байна
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(repayment.repaymentDate)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-positive">
                        {formatAmount(repayment.amount, repayment.currency)}
                      </span>
                    </div>
                    {repayment.memo && (
                      <p className="text-xs text-muted-foreground">{repayment.memo}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRepaymentAction(repayment, "completed")}
                        disabled={updateRepaymentStatus.isPending}
                        className="flex-1 h-10 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Зөвшөөрөх
                      </button>
                      <button
                        onClick={() => handleRepaymentAction(repayment, "rejected")}
                        disabled={updateRepaymentStatus.isPending}
                        className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Татгалзах
                      </button>
                      <button
                        onClick={() => handleRepaymentView(repayment)}
                        className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        Дэлгэрэнгүй
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
