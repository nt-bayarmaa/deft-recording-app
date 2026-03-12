import { supabase } from "@/integrations/supabase/client";
import type { PersonBalance } from "@/types";

export async function getPersonBalances(appUserId: string): Promise<PersonBalance[]> {
  const [loansRes, repaymentsRes, friendsRes] = await Promise.all([
    supabase.from("loans").select("*").or(`lender_id.eq.${appUserId},borrower_id.eq.${appUserId}`),
    supabase.from("repayments").select("*").eq("status", "completed"),
    supabase.from("user_friends").select("friend_id, friend:users!user_friends_friend_id_fkey(id, nickname, username)").eq("user_id", appUserId),
  ]);

  if (loansRes.error) throw loansRes.error;
  if (repaymentsRes.error) throw repaymentsRes.error;
  if (friendsRes.error) throw friendsRes.error;

  const loans = loansRes.data;
  const repayments = repaymentsRes.data;

  // Build name lookup from friends
  const nameMap = new Map<string, string>();
  for (const f of friendsRes.data as any[]) {
    if (f.friend) {
      nameMap.set(f.friend_id, f.friend.nickname || f.friend.username || f.friend_id.slice(0, 8));
    }
  }

  // Group completed repayments by loan_id
  const repaymentsByLoan = new Map<string, number>();
  for (const r of repayments) {
    repaymentsByLoan.set(r.loan_id, (repaymentsByLoan.get(r.loan_id) ?? 0) + Number(r.amount));
  }

  // Build balances per person
  const balanceMap = new Map<string, { personId: string; name: string; balance: number; currency: string; hasPending: boolean }>();

  for (const loan of loans) {
    const isLender = loan.lender_id === appUserId;
    const otherPersonId = isLender ? loan.borrower_id : loan.lender_id;
    const otherName = nameMap.get(otherPersonId) ?? otherPersonId.slice(0, 8);
    const key = `${otherPersonId}:${loan.currency}`;

    if (!balanceMap.has(key)) {
      balanceMap.set(key, { personId: otherPersonId, name: otherName, balance: 0, currency: loan.currency, hasPending: false });
    }

    const entry = balanceMap.get(key)!;

    if (loan.status === "pending_borrower_approval") {
      entry.hasPending = true;
      continue;
    }

    if (loan.status === "completed") {
      const loanAmount = Number(loan.amount);
      const repaid = repaymentsByLoan.get(loan.id) ?? 0;
      const remaining = loanAmount - repaid;
      entry.balance += isLender ? remaining : -remaining;
    }
  }

  return Array.from(balanceMap.values());
}
