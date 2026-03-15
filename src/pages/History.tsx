import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { mn } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { useLoans, useRepayments, useFriends } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { getFriendDisplayName } from "@/data/users";
import { formatAmount, formatDate } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type FilterMode = "week" | "month" | "custom";
type DirectionFilter = "all" | "incoming" | "outgoing";

type HistoryItem = {
  id: string;
  date: string;
  type: string;
  person: string;
  amount: number;
  currency: string;
  isPositive: boolean;
  status: string;
  memo?: string;
};

function groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
  const map: Record<string, HistoryItem[]> = {};
  for (const item of items) {
    const key = item.date.split("T")[0];
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams();
  const directionParam = searchParams.get(
    "direction",
  ) as DirectionFilter | null;
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>(
    directionParam || "all",
  );

  const [filter, setFilter] = useState<FilterMode>("week");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [pickingField, setPickingField] = useState<"from" | "to">("from");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const dir = searchParams.get("direction") as DirectionFilter | null;
    if (dir && (dir === "all" || dir === "incoming" || dir === "outgoing")) {
      setDirectionFilter(dir);
    }
  }, [searchParams]);

  const { appUser } = useAuth();
  const {
    data: loans = [],
    isLoading: loansLoading,
    error: loansError,
  } = useLoans();
  const {
    data: repayments = [],
    isLoading: repaymentsLoading,
    error: repaymentsError,
  } = useRepayments();
  const { data: friends = [] } = useFriends();

  const currentUserId = appUser?.id ?? "";
  const isLoading = loansLoading || repaymentsLoading;
  const error = loansError || repaymentsError;

  const nameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of friends) {
      m.set(f.friendId, getFriendDisplayName(f.nickname, f.friend));
    }
    return m;
  }, [friends]);

  const getOtherName = (loan: (typeof loans)[0]) => {
    const isLender = loan.lenderId === currentUserId;
    const otherId = isLender ? loan.borrowerId : loan.lenderId;
    return nameMap.get(otherId) ?? otherId.slice(0, 8);
  };

  const statusLabel = (status: string) => {
    if (status === "completed") return "Зөвшөөрсөн";
    if (status === "rejected") return "Татгалзсан";
    return "Хүлээгдэж буй";
  };

  const statusColor = (status: string) => {
    if (status === "completed") return "bg-positive-light text-positive";
    if (status === "rejected") return "bg-negative-light text-negative";
    return "bg-amber-100 text-amber-800";
  };

  const allItems = useMemo(
    () =>
      [
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
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [loans, repayments, nameMap, currentUserId],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (directionFilter === "incoming" && !item.isPositive) return false;
      if (directionFilter === "outgoing" && item.isPositive) return false;

      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);

      if (filter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo && d <= today;
      }
      if (filter === "month") {
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }
      if (customFrom && d < customFrom) return false;
      if (customTo && d > customTo) return false;
      return true;
    });
  }, [allItems, directionFilter, filter, customFrom, customTo, today]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const sortedDates = useMemo(
    () => Object.keys(grouped).sort((a, b) => b.localeCompare(a)),
    [grouped],
  );

  const rangeLabel = useMemo(() => {
    if (filter === "custom" && customFrom && customTo) {
      return `${format(customFrom, "MMM d", { locale: mn })} – ${format(customTo, "MMM d", { locale: mn })}`;
    }
    if (filter === "custom" && customFrom) {
      return `${format(customFrom, "MMM d", { locale: mn })}-аас`;
    }
    return null;
  }, [filter, customFrom, customTo]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (pickingField === "from") {
      setCustomFrom(date);
      setPickingField("to");
    } else {
      setCustomTo(date);
      setPopoverOpen(false);
      setPickingField("from");
    }
  };

  const handleDirectionChange = (dir: DirectionFilter) => {
    setDirectionFilter(dir);
    const next = new URLSearchParams(searchParams);
    if (dir === "all") {
      next.delete("direction");
    } else {
      next.set("direction", dir);
    }
    setSearchParams(next);
  };

  const filterOptions: { value: FilterMode; label: string }[] = [
    { value: "week", label: "Долоо хоног" },
    { value: "month", label: "Сар" },
    { value: "custom", label: "Сонголт" },
  ];

  const directionOptions: { value: DirectionFilter; label: string }[] = [
    { value: "all", label: "Бүгд" },
    { value: "incoming", label: "↑ Орсон" },
    { value: "outgoing", label: "↓ Гарсан" },
  ];

  const pageTitle =
    directionFilter === "incoming"
      ? "Орсон"
      : directionFilter === "outgoing"
        ? "Гарсан"
        : "Түүх";

  return (
    <AppLayout>
      <div className="container px-4 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border p-4 h-20 bg-muted"
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
        ) : (
          <>
            {/* Direction filter */}
            <div className="flex rounded-xl bg-muted/50 p-0.5 gap-0.5">
              {directionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleDirectionChange(opt.value)}
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors",
                    directionFilter === opt.value
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Time period filter */}
            <div className="flex rounded-xl bg-muted/50 p-0.5 gap-0.5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    if (opt.value !== "custom") {
                      setCustomFrom(undefined);
                      setCustomTo(undefined);
                    }
                  }}
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 rounded-lg transition-colors",
                    filter === opt.value
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom date picker */}
            {filter === "custom" && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center justify-between w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-muted/30 transition-colors"
                    onClick={() => {
                      setPickingField("from");
                      setPopoverOpen(true);
                    }}
                  >
                    <span
                      className={cn(!customFrom && "text-muted-foreground")}
                    >
                      {customFrom
                        ? format(customFrom, "MMM d, yyyy", { locale: mn })
                        : "Эхлэх өдөр"}
                    </span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className={cn(!customTo && "text-muted-foreground")}>
                      {customTo
                        ? format(customTo, "MMM d, yyyy", { locale: mn })
                        : "Дуусах өдөр"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl"
                  align="center"
                >
                  <div className="px-3 pt-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {pickingField === "from"
                        ? "Эхлэх өдөр сонгох"
                        : "Дуусах өдөр сонгох"}
                    </p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={pickingField === "from" ? customFrom : customTo}
                    onSelect={handleCalendarSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            {rangeLabel && (
              <p className="text-[11px] font-semibold text-muted-foreground tracking-wide">
                {rangeLabel}
              </p>
            )}

            {sortedDates.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Энэ хугацаанд гүйлгээ байхгүй</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {formatDate(date)}
                    </p>
                    <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
                      {grouped[date].map((item) => (
                        <div key={item.id} className="p-4 bg-card space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.person}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {item.type}
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                    statusColor(item.status),
                                  )}
                                >
                                  {statusLabel(item.status)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={cn(
                                  "text-sm font-semibold tabular-nums",
                                  item.isPositive
                                    ? "text-positive"
                                    : "text-negative",
                                )}
                              >
                                {item.isPositive ? "+" : "-"}
                                {formatAmount(item.amount, item.currency)}
                              </span>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {formatDate(item.date)}
                              </p>
                            </div>
                          </div>
                          {item.memo && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.memo}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
