import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LoanSelectItem } from "@/types";

interface LoanSelectProps {
  loans: LoanSelectItem[];
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

const MEMO_MAX_LENGTH = 25;

function formatLoanLabel(loan: LoanSelectItem, truncate = true): string {
  const memo =
    truncate && loan.memo.length > MEMO_MAX_LENGTH
      ? loan.memo.slice(0, MEMO_MAX_LENGTH) + "..."
      : loan.memo;
  return `₮${loan.amount.toLocaleString()} - ${loan.loanDate} (${memo})`;
}

export function LoanSelect({
  loans,
  value,
  onValueChange,
  id = "loan",
  placeholder = "Зээл сонгоно уу",
}: LoanSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        className="w-full h-12 px-4 py-3.5 bg-muted/30 rounded-xl border border-border focus:ring-2 focus:ring-ring"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl max-h-[240px] overflow-y-auto min-w-[280px]">
        {loans.map((loan) => (
          <SelectItem
            key={loan.id}
            value={String(loan.id)}
            className="rounded-lg cursor-pointer py-2.5 overflow-hidden"
          >
            <span className="block truncate min-w-0" title={formatLoanLabel(loan, false)}>
              {formatLoanLabel(loan)}
            </span>
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value="__manual__" className="rounded-lg cursor-pointer py-2.5">
          Бүртгээгүй зээл
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
