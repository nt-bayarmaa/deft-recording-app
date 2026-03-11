import { supabase } from "@/integrations/supabase/client";
import type { PersonBalance } from "@/types";

export async function getPersonBalances(currentUserId: string): Promise<PersonBalance[]> {
  const [loansRes, repaymentsRes] = await Promise.all([
    supabase.from("loans").select("*").or(`lender_id.eq.${currentUserId},borrower_id.eq.${currentUserId}`),
    supabase.from("repayments").select("*"),
  ]);

  if (loansRes.error) throw loansRes.error;
  if (repaymentsRes.error) throw repaymentsRes.error;

  const loans = loansRes.data;
  const repayments = repaymentsRes.data;

  // Group repayments by loan_id
  const repaymentsByLoan = new Map<string, number>();
  for (const r of repayments) {
    repaymentsByLoan.set(r.loan_id, (repaymentsByLoan.get(r.loan_id) ?? 0) + Number(r.amount));
  }

  // Build balances per person (keyed by the other party's id + currency)
  const balanceMap = new Map<string, { personId: string; name: string; balance: number; currency: string; hasPending: boolean }>();

  for (const loan of loans) {
    const isLender = loan.lender_id === currentUserId;
    const otherPersonId = isLender ? loan.borrower_id : loan.lender_id;
    const otherName = isLender ? loan.borrower_name : loan.lender_name;
    const key = `${otherPersonId}:${loan.currency}`;

    if (!balanceMap.has(key)) {
      balanceMap.set(key, { personId: otherPersonId, name: otherName, balance: 0, currency: loan.currency, hasPending: false });
    }

    const entry = balanceMap.get(key)!;

    if (loan.status === "pending") {
      entry.hasPending = true;
      continue; // Don't count pending loans in balance
    }

    if (loan.status === "approved") {
      const loanAmount = Number(loan.amount);
      const repaid = repaymentsByLoan.get(loan.id) ?? 0;
      const remaining = loanAmount - repaid;
      // Positive = they owe us, negative = we owe them
      entry.balance += isLender ? remaining : -remaining;
    }
  }

  return Array.from(balanceMap.values()).map((b) => ({
    personId: Number(b.personId) || 0,
    name: b.name,
    balance: b.balance,
    currency: b.currency,
    hasPending: b.hasPending,
  }));
}
