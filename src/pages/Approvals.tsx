import { AppLayout } from "@/components/AppLayout";
import { useLoans, useUpdateLoanStatus } from "@/hooks/useQueries";
import { formatAmount, formatDate } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function Approvals() {
  const { data: loans = [], isLoading, error } = useLoans();
  const updateStatus = useUpdateLoanStatus();
  const { toast } = useToast();

  const pendingLoans = loans.filter((l) => l.status === "pending");

  const handleAction = (id: string, status: "approved" | "rejected") => {
    updateStatus.mutate(
      { id, status },
      { onError: (err) => toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" }) }
    );
  };

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Хүсэлт</h1>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border p-4 h-32 bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : pendingLoans.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Хүлээгдэж буй хүсэлт байхгүй</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-border p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                      {loan.borrowerName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {loan.type === "give" ? loan.borrowerName : loan.lenderName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.type === "give" ? "Зээл өгөх" : "Зээл авах"} · {formatDate(loan.loanDate)}
                      </p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold tabular-nums", loan.type === "give" ? "text-positive" : "text-negative")}>
                    {formatAmount(loan.amount, loan.currency)}
                  </span>
                </div>
                {loan.memo && <p className="text-xs text-muted-foreground">{loan.memo}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(loan.id, "approved")}
                    disabled={updateStatus.isPending}
                    className="flex-1 h-10 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Зөвшөөрөх
                  </button>
                  <button
                    onClick={() => handleAction(loan.id, "rejected")}
                    disabled={updateStatus.isPending}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Татгалзах
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
