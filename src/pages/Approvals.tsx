import { AppLayout } from "@/components/AppLayout";
import { mockLoans, formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function Approvals() {
  const pendingLoans = mockLoans.filter((l) => l.status === "pending");

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Хүсэлт</h1>

        {pendingLoans.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Хүлээгдэж буй хүсэлт байхгүй</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-2xl border border-border p-4 bg-card space-y-3"
              >
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
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      loan.type === "give" ? "text-positive" : "text-negative"
                    )}
                  >
                    {formatAmount(loan.amount, loan.currency)}
                  </span>
                </div>
                {loan.memo && (
                  <p className="text-xs text-muted-foreground">{loan.memo}</p>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 h-10 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Зөвшөөрөх
                  </button>
                  <button className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5">
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
