import type { Person, Loan, Repayment, Notification, PersonBalance, LoanSelectItem } from "@/types";

export const mockPersons: Person[] = [
  { id: 1, name: "Батбаяр" },
  { id: 2, name: "Оюунчимэг" },
  { id: 3, name: "Ганбат" },
  { id: 4, name: "Сарнай" },
];

export const mockLoans: Loan[] = [
  {
    id: "loan-1",
    lenderId: "me",
    borrowerId: "1",
    borrowerName: "Батбаяр",
    lenderName: "Би",
    amount: 500000,
    currency: "MNT",
    loanDate: "2026-02-15",
    dueDate: "2026-03-15",
    memo: "Гар утас засуулах",
    type: "give",
    status: "approved",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "loan-2",
    lenderId: "2",
    borrowerId: "me",
    borrowerName: "Би",
    lenderName: "Оюунчимэг",
    amount: 200000,
    currency: "MNT",
    loanDate: "2026-02-20",
    dueDate: "2026-03-20",
    memo: "Оюутны төлбөр",
    type: "take",
    status: "approved",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "loan-3",
    lenderId: "me",
    borrowerId: "3",
    borrowerName: "Ганбат",
    lenderName: "Би",
    amount: 1000000,
    currency: "MNT",
    loanDate: "2026-03-01",
    dueDate: "2026-04-01",
    memo: "Машины засвар",
    type: "give",
    status: "pending",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "loan-4",
    lenderId: "4",
    borrowerId: "me",
    borrowerName: "Би",
    lenderName: "Сарнай",
    amount: 50,
    currency: "USD",
    loanDate: "2026-03-05",
    dueDate: "2026-03-12",
    memo: "Хоолны мөнгө",
    type: "take",
    status: "pending",
    createdAt: "2026-03-05T10:00:00Z",
  },
];

export const mockRepayments: Repayment[] = [
  {
    id: "rep-1",
    loanId: "loan-1",
    amount: 100000,
    currency: "MNT",
    repaymentDate: "2026-03-01",
    memo: "Эхний төлбөр",
    type: "receive",
    status: "approved",
    createdByUserId: "1",
    personName: "Батбаяр",
    createdAt: "2026-03-01T12:00:00Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "me",
    type: "loan_request",
    relatedLoanId: "loan-3",
    read: false,
    message: "Ганбат зээлийн хүсэлт илгээлээ",
    amount: 1000000,
    currency: "MNT",
    personName: "Ганбат",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "notif-2",
    userId: "me",
    type: "repayment_recorded",
    relatedRepaymentId: "rep-1",
    read: true,
    message: "Батбаяр төлбөр бүртгэлээ",
    amount: 100000,
    currency: "MNT",
    personName: "Батбаяр",
    createdAt: "2026-03-01T12:00:00Z",
  },
];

export const mockBalances: PersonBalance[] = [
  { personId: 1, name: "Батбаяр", balance: 400000, currency: "MNT", hasPending: false },
  { personId: 2, name: "Оюунчимэг", balance: -200000, currency: "MNT", hasPending: false },
  { personId: 3, name: "Ганбат", balance: 1000000, currency: "MNT", hasPending: true },
  { personId: 4, name: "Сарнай", balance: -50, currency: "USD", hasPending: true },
];

export const mockLoanSelectItems: LoanSelectItem[] = [
  { id: "loan-1", userId: 1, amount: 500000, loanDate: "2026-02-15", dueDate: "2026-03-15", memo: "Гар утас засуулах" },
  { id: "loan-2", userId: 2, amount: 200000, loanDate: "2026-02-20", dueDate: "2026-03-20", memo: "Оюутны төлбөр" },
];

export const BANKS = [
  { value: "khan", label: "Хаан банк" },
  { value: "golomt", label: "Голомт банк" },
  { value: "tdb", label: "ХХБ" },
  { value: "state", label: "Төрийн банк" },
  { value: "xac", label: "ХасБанк" },
  { value: "other", label: "Бусад" },
];

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
