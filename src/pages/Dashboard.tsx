import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { formatAmount } from "@/data/mock";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getPersonBalances } from "@/data/balances";

export default function Dashboard() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const userId = appUser?.id ?? "";

  const { data: balances = [], isLoading, error } = useQuery({
    queryKey: ["balances", userId],
    queryFn: () => getPersonBalances(userId),
    enabled: !!userId,
  });

  const totalReceivable = balances
    .filter((b) => b.balance > 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + b.balance, 0);
  const totalOwed = balances
    .filter((b) => b.balance < 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Нүүр</h1>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4 h-24 bg-muted" />
              <div className="rounded-2xl border border-border p-4 h-24 bg-muted" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-positive-light">
                <div className="flex items-center gap-2 text-positive">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Авах дүн</span>
                </div>
                <p className="text-xl font-bold text-positive tabular-nums">
                  {formatAmount(totalReceivable, "MNT")}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-negative-light">
                <div className="flex items-center gap-2 text-negative">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Өгөх дүн</span>
                </div>
                <p className="text-xl font-bold text-negative tabular-nums">
                  {formatAmount(totalOwed, "MNT")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Хүмүүс</h2>
              {balances.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-sm">Зээл бүртгэгдээгүй байна</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {balances.map((person) => (
                    <button
                      key={person.personId}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => navigate(`/history?person=${person.personId}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                          {person.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{person.name}</p>
                          {person.hasPending && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Хүлээгдэж буй
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            person.balance > 0 ? "text-positive" : "text-negative"
                          )}
                        >
                          {person.balance > 0 ? "+" : ""}
                          {formatAmount(Math.abs(person.balance), person.currency)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
