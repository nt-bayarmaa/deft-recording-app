import type { Loan, Repayment, Notification, PersonBalance, LoanSelectItem } from "@/types";

export const BANKS = [
  { value: "khan", label: "Хаан банк" },
  { value: "golomt", label: "Голомт банк" },
  { value: "tdb", label: "ХХБ" },
  { value: "state", label: "Төрийн банк" },
  { value: "xac", label: "ХасБанк" },
  { value: "other", label: "Бусад" },
];

export function getBankLabel(value: string): string {
  return BANKS.find((b) => b.value === value)?.label ?? value;
}

export function formatAmount(amount: number, currency: string = "MNT"): string {
  const symbols: Record<string, string> = { USD: "$", MNT: "₮", CNY: "¥" };
  const symbol = symbols[currency] ?? currency;
  const isInteger = ["MNT", "JPY", "KRW", "CNY"].includes(currency);
  return `${symbol}${isInteger ? Math.round(amount).toLocaleString("mn-MN") : amount.toFixed(2)}`;
}

export function formatAccountNumber(account: string): string {
  return account.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
