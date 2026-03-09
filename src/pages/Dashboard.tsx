import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { mockBalances } from "@/data/mock";
import { formatAmount } from "@/data/mock";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/AppLayout";

export default function Dashboard() {
  const navigate = useNavigate();

  const totalReceivable = mockBalances
    .filter((b) => b.balance > 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + b.balance, 0);
  const totalOwed = mockBalances
    .filter((b) => b.balance < 0 && b.currency === "MNT")
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Нүүр</h1>

        {/* Summary cards */}
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

        {/* Person list */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Хүмүүс</h2>
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {mockBalances.map((person) => (
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
        </div>
      </div>
    </AppLayout>
  );
}
