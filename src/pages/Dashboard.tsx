import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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

  const {
    data: balances = [],
    isLoading,
    error,
  } = useQuery({
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
  const netBalance = totalReceivable - totalOwed;

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
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
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">
              {(error as Error).message}
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
                <div className="flex-1 cursor-pointer hover:bg-accent/30 rounded-lg p-2 -m-2 transition-colors" onClick={() => navigate("/history?direction=incoming")}>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">↑ Авах</p>
                  <p className="font-mono text-lg font-bold text-positive mt-0.5 tabular-nums">+{formatAmount(totalReceivable, "MNT")}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 cursor-pointer hover:bg-accent/30 rounded-lg p-2 -m-2 transition-colors" onClick={() => navigate("/history?direction=outgoing")}>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">↓ Өгөх</p>
                  <p className="font-mono text-lg font-bold text-negative mt-0.5 tabular-nums">−{formatAmount(totalOwed, "MNT")}</p>
                </div>
              </div>
            </div>

            {/* Balances — compact, data-dense */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Үлдэгдэл</h2>
                <button onClick={() => navigate("/friends")} className="text-[11px] text-muted-foreground font-medium flex items-center gap-0.5 hover:text-foreground transition-colors">
                  Бүгд <ChevronRight size={11} />
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {balances.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground py-2">Зээл бүртгэгдээгүй байна</p>
                ) : (
                  balances
                    .filter((b) => b.balance !== 0)
                    .slice(0, 4)
                    .map((person) => (
                      <div
                        key={`${person.personId}-${person.currency}`}
                        onClick={() => navigate(`/history?person=${person.personId}`)}
                        className="flex items-center gap-2.5 py-2.5 px-1 cursor-pointer hover:bg-accent/30 rounded-lg transition-colors"
                      >
                        <span className={cn("text-sm shrink-0", person.balance > 0 ? "text-positive" : "text-negative")}>
                          {person.balance > 0 ? "↑" : "↓"}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-secondary-foreground shrink-0">
                          {person.name[0]}
                        </div>
                        <span className="text-[13px] font-medium text-foreground flex-1 truncate">{person.name}</span>
                        <span className={cn("font-mono text-[13px] font-bold tabular-nums", person.balance > 0 ? "text-positive" : "text-negative")}>
                          {person.balance > 0 ? "+" : "−"}
                          {formatAmount(Math.abs(person.balance), person.currency)}
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
