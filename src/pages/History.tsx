import { AppLayout } from "@/components/AppLayout";
import { useLoans, useRepayments, useContacts } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";

export default function History() {
  const { session } = useAuth();
  const { data: loans = [], isLoading: loansLoading, error: loansError } = useLoans();
  const { data: repayments = [], isLoading: repaymentsLoading, error: repaymentsError } = useRepayments();
  const { data: contacts = [] } = useContacts();

  const currentUserId = session?.user?.id ?? "";
  const isLoading = loansLoading || repaymentsLoading;
  const error = loansError || repaymentsError;

  // Build contact name lookup
  const contactNameMap = new Map<string, string>();
  for (const c of contacts) {
    contactNameMap.set(c.id, c.name);
    if (c.linkedUserId) contactNameMap.set(c.linkedUserId, c.name);
  }

  const getOtherName = (loan: typeof loans[0]) => {
    const isLender = loan.lenderId === currentUserId;
    const otherId = isLender ? loan.borrowerId : loan.lenderId;
    return contactNameMap.get(otherId) ?? otherId.slice(0, 8);
  };

  const allItems = [
    ...loans.map((l) => ({
      id: l.id,
      date: l.createdAt,
      type: l.type === "give" ? "Зээл өгсөн" : "Зээл авсан",
      person: getOtherName(l),
      amount: l.amount,
      currency: l.currency,
      isPositive: l.type === "give",
      status: l.status,
      memo: l.memo,
    })),
    ...repayments.map((r) => ({
      id: r.id,
      date: r.createdAt,
      type: r.type === "receive" ? "Төлбөр авсан" : "Төлбөр төлсөн",
      person: r.personName,
      amount: r.amount,
      currency: r.currency,
      isPositive: r.type === "receive",
      status: r.status,
      memo: r.memo,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Түүх</h1>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border p-4 h-20 bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive space-y-2">
            <p className="text-sm">Алдаа гарлаа</p>
            <p className="text-xs text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Гүйлгээ байхгүй</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {allItems.map((item) => (
              <div key={item.id} className="p-4 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.person}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{item.type}</span>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded",
                          item.status === "approved"
                            ? "bg-positive-light text-positive"
                            : item.status === "rejected"
                            ? "bg-negative-light text-negative"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {item.status === "approved" ? "Зөвшөөрсөн" : item.status === "rejected" ? "Татгалзсан" : "Хүлээгдэж буй"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("text-sm font-semibold tabular-nums", item.isPositive ? "text-positive" : "text-negative")}>
                      {item.isPositive ? "+" : "-"}
                      {formatAmount(item.amount, item.currency)}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
                {item.memo && (
                  <p className="text-xs text-muted-foreground truncate">{item.memo}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
