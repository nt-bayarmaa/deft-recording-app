import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BANKS } from "@/data/mock";

interface BankAccountInputProps {
  id?: string;
  bank: string;
  onBankChange: (bank: string) => void;
  account: string;
  onAccountChange: (account: string) => void;
  placeholder?: string;
}

export function BankAccountInput({
  id,
  bank,
  onBankChange,
  account,
  onAccountChange,
  placeholder = "Дансны дугаар",
}: BankAccountInputProps) {
  return (
    <div className="flex gap-2">
      <Select value={bank} onValueChange={onBankChange}>
        <SelectTrigger className="w-36 h-12 rounded-xl">
          <SelectValue placeholder="Банк" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {BANKS.map((b) => (
            <SelectItem key={b.value} value={b.value}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={account}
        onChange={(e) => onAccountChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="flex-1 h-12 px-4 py-3.5 bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm tabular-nums transition-shadow"
      />
    </div>
  );
}
