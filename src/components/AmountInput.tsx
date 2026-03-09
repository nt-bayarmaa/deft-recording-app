import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AmountInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  placeholder?: string;
}

export function formatAmountInput(value: string): string {
  const num = value.replace(/[^\d.]/g, "");
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

export function AmountInput({
  id,
  value,
  onChange,
  currency,
  onCurrencyChange,
  placeholder = "0.00",
}: AmountInputProps) {
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(formatAmountInput(e.target.value))}
        placeholder={placeholder}
        className="flex-1 h-12 px-4 py-3.5 bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm tabular-nums transition-shadow"
      />
      <Select value={currency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-24 h-12 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="MNT">₮ MNT</SelectItem>
          <SelectItem value="USD">$ USD</SelectItem>
          <SelectItem value="CNY">¥ CNY</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
