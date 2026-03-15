import { useState } from "react";
import { formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getPersonBalances } from "@/data/balances";
import { useActiveLoans } from "@/hooks/useQueries";

type LoanFilter = "all" | "incoming" | "outgoing";

export default function Dashboard() {
  const { appUser } = useAuth();
  const userId = appUser?.id ?? "";
  const [loanFilter, setLoanFilter] = useState<LoanFilter>("all");

  const {
    data: balances = [],
    isLoading: balancesLoading,
    error: balancesError,
  } = useQuery({
    queryKey: ["balances", userId],
    queryFn: () => getPersonBalances(userId),
    enabled: !!userId,
  });

  const direction: "incoming" | "outgoing" | undefined =
    loanFilter === "incoming" ? "incoming" : loanFilter === "outgoing" ? "outgoing" : undefined;
  const { data: activeLoans = [], isLoading: loansLoading } = useActiveLoans(direction);

  const totalReceivable = balances
    .filter((b) => b.balance > 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + b.balance, 0);
  const totalOwed = balances
    .filter((b) => b.balance < 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);
  const netBalance = totalReceivable - totalOwed;

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        {balancesLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-32 bg-muted rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5">
                <div className="w-7 h-7 rounded-full bg-muted" />
                <div className="h-4 flex-1 rounded bg-muted" />
                <div className="w-16 h-4 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : balancesError ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">
              {(balancesError as Error).message}
            </p>
          </div>
        ) : (
          <>
            {/* Balance summary — numbers first */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Нийт үлдэгдэл</p>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded", netBalance >= 0 ? "bg-positive-light text-positive" : "bg-negative-light text-negative")}>
                  {netBalance >= 0 ? "Таны авлага" : "Таны өглөг"}
                </span>
              </div>
              <p className={cn("font-mono text-[40px] font-bold leading-none tracking-tight tabular-nums", netBalance >= 0 ? "text-positive" : "text-negative")}>
                {netBalance >= 0 ? "+" : "−"}
                {formatAmount(Math.abs(netBalance), "MNT")}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">↑ Авах</p>
                  <p className="font-mono text-lg font-bold text-positive mt-0.5 tabular-nums">+{formatAmount(totalReceivable, "MNT")}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">↓ Өгөх</p>
                  <p className="font-mono text-lg font-bold text-negative mt-0.5 tabular-nums">−{formatAmount(totalOwed, "MNT")}</p>
                </div>
              </div>
            </div>

            {/* Идэвхтэй зээлүүд — filter-тэй */}
            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5">Идэвхтэй зээл</h2>
              <div className="flex rounded-xl bg-muted/50 p-0.5 gap-0.5 mb-3">
                <button
                  onClick={() => setLoanFilter("all")}
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors",
                    loanFilter === "all"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Бүгд
                </button>
                <button
                  onClick={() => setLoanFilter("incoming")}
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors",
                    loanFilter === "incoming"
                      ? "bg-card text-positive shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ↑ Авлага
                </button>
                <button
                  onClick={() => setLoanFilter("outgoing")}
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors",
                    loanFilter === "outgoing"
                      ? "bg-card text-negative shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ↓ Өглөг
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {loansLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2.5 px-1">
                      <div className="w-4 h-4 rounded bg-muted" />
                      <div className="w-7 h-7 rounded-full bg-muted" />
                      <div className="h-4 flex-1 rounded bg-muted" />
                      <div className="w-16 h-4 rounded bg-muted" />
                    </div>
                  ))
                ) : activeLoans.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground py-2">Идэвхтэй зээл байхгүй</p>
                ) : (
                  activeLoans.slice(0, 8).map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center gap-2.5 py-2.5 px-1"
                    >
                      <span className={cn("text-sm shrink-0", loan.isIncoming ? "text-positive" : "text-negative")}>
                        {loan.isIncoming ? "↑" : "↓"}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-secondary-foreground shrink-0">
                        {loan.personName[0] || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-medium text-foreground truncate block">{loan.personName}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDate(loan.dueDate)}</span>
                      </div>
                      <span className={cn("font-mono text-[13px] font-bold shrink-0 tabular-nums", loan.isIncoming ? "text-positive" : "text-negative")}>
                        {loan.isIncoming ? "+" : "−"}
                        {formatAmount(loan.remaining, loan.currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
