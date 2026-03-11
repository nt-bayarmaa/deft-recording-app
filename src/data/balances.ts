import { supabase } from "@/integrations/supabase/client";
import type { PersonBalance } from "@/types";

export async function getPersonBalances(currentUserId: string): Promise<PersonBalance[]> {
  const [loansRes, repaymentsRes, contactsRes] = await Promise.all([
    supabase.from("loans").select("*").or(`lender_id.eq.${currentUserId},borrower_id.eq.${currentUserId}`),
    supabase.from("repayments").select("*"),
    supabase.from("contacts").select("id, name, linked_user_id").eq("owner_user_id", currentUserId),
  ]);

  if (loansRes.error) throw loansRes.error;
  if (repaymentsRes.error) throw repaymentsRes.error;
  if (contactsRes.error) throw contactsRes.error;

  const loans = loansRes.data;
  const repayments = repaymentsRes.data;
  const contacts = contactsRes.data;

  // Build a name lookup from contacts
  const contactNameMap = new Map<string, string>();
  for (const c of contacts) {
    contactNameMap.set(c.id, c.name);
    if (c.linked_user_id) contactNameMap.set(c.linked_user_id, c.name);
  }

  // Group repayments by loan_id
  const repaymentsByLoan = new Map<string, number>();
  for (const r of repayments) {
    repaymentsByLoan.set(r.loan_id, (repaymentsByLoan.get(r.loan_id) ?? 0) + Number(r.amount));
  }

  // Build balances per person
  const balanceMap = new Map<string, { personId: string; name: string; balance: number; currency: string; hasPending: boolean }>();

  for (const loan of loans) {
    const isLender = loan.lender_id === currentUserId;
    const otherPersonId = isLender ? loan.borrower_id : loan.lender_id;
    const otherName = contactNameMap.get(otherPersonId) ?? otherPersonId.slice(0, 8);
    const key = `${otherPersonId}:${loan.currency}`;

    if (!balanceMap.has(key)) {
      balanceMap.set(key, { personId: otherPersonId, name: otherName, balance: 0, currency: loan.currency, hasPending: false });
    }

    const entry = balanceMap.get(key)!;

    if (loan.status === "pending" || loan.status === "pending_borrower_approval") {
      entry.hasPending = true;
      continue;
    }

    if (loan.status === "approved") {
      const loanAmount = Number(loan.amount);
      const repaid = repaymentsByLoan.get(loan.id) ?? 0;
      const remaining = loanAmount - repaid;
      entry.balance += isLender ? remaining : -remaining;
    }
  }

  return Array.from(balanceMap.values()).map((b) => ({
    personId: b.personId,
    name: b.name,
    balance: b.balance,
    currency: b.currency,
    hasPending: b.hasPending,
  }));
}
