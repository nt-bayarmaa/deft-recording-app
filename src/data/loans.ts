import { supabase } from "@/integrations/supabase/client";
import type { Loan, LoanStatus, LoanSelectItem, ActiveLoanItem } from "@/types";
import type { RepaymentType } from "@/types";

function generateApprovalToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function mapLoan(row: any): Loan {
  return {
    id: row.id,
    lenderId: row.lender_id,
    borrowerId: row.borrower_id,
    amount: row.amount,
    currency: row.currency,
    loanDate: row.loan_date,
    dueDate: row.due_date,
    memo: row.memo ?? "",
    type: row.type,
    status: row.status,
    approvalToken: row.approval_token,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  };
}

export async function getLoans(userId: string): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapLoan);
}

export async function getLoansForPerson(
  userId: string,
  personId: string,
): Promise<LoanSelectItem[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("id, amount, loan_date, due_date, memo")
    .eq("status", "completed")
    .or(
      `and(lender_id.eq.${userId},borrower_id.eq.${personId}),and(lender_id.eq.${personId},borrower_id.eq.${userId})`,
    )
    .order("loan_date", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    amount: row.amount,
    loanDate: row.loan_date,
    dueDate: row.due_date,
    memo: row.memo ?? "",
  }));
}

/** Active loans (remaining balance > 0) for repayment flow, filtered by direction.
 * pay: зээл авсан - надад зээл өгсөн хүнээс авсан зээл (lender=personId, borrower=userId)
 * receive: зээл өгсөн - надаас зээл авсан хүнээс авах төлбөр (lender=userId, borrower=personId)
 */
export async function getActiveLoansForPerson(
  userId: string,
  personId: string,
  repaymentType: RepaymentType,
): Promise<LoanSelectItem[]> {
  const isPay = repaymentType === "pay";
  const lenderId = isPay ? personId : userId;
  const borrowerId = isPay ? userId : personId;

  const { data: loansData, error: loansError } = await supabase
    .from("loans")
    .select("id, amount, loan_date, due_date, memo")
    .in("status", ["completed", "approved"])
    .eq("lender_id", lenderId)
    .eq("borrower_id", borrowerId)
    .order("loan_date", { ascending: false });

  if (loansError) throw loansError;
  if (!loansData?.length) return [];

  const loanIds = loansData.map((l) => l.id);
  const { data: repaymentsData, error: repaymentsError } = await supabase
    .from("repayments")
    .select("loan_id, amount")
    .in("loan_id", loanIds)
    .eq("status", "completed");

  if (repaymentsError) throw repaymentsError;

  const repaidByLoan = new Map<string, number>();
  for (const r of repaymentsData ?? []) {
    repaidByLoan.set(
      r.loan_id,
      (repaidByLoan.get(r.loan_id) ?? 0) + Number(r.amount),
    );
  }

  return loansData
    .filter((row) => {
      const amount = Number(row.amount);
      const repaid = repaidByLoan.get(row.id) ?? 0;
      return amount - repaid > 0;
    })
    .map((row) => ({
      id: row.id,
      amount: row.amount,
      loanDate: row.loan_date,
      dueDate: row.due_date,
      memo: row.memo ?? "",
    }));
}

/** All active loans (remaining balance > 0) for the user, sorted by due date. */
export async function getActiveLoans(
  userId: string,
  direction?: "incoming" | "outgoing",
): Promise<ActiveLoanItem[]> {
  const { data: loansData, error: loansError } = await supabase
    .from("loans")
    .select("*")
    .in("status", ["completed", "approved"])
    .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
    .order("due_date", { ascending: true });

  if (loansError) throw loansError;
  if (!loansData?.length) return [];

  const loanIds = loansData.map((l) => l.id);
  const { data: repaymentsData, error: repaymentsError } = await supabase
    .from("repayments")
    .select("loan_id, amount")
    .in("loan_id", loanIds)
    .eq("status", "completed");

  if (repaymentsError) throw repaymentsError;

  const repaidByLoan = new Map<string, number>();
  for (const r of repaymentsData ?? []) {
    repaidByLoan.set(
      r.loan_id,
      (repaidByLoan.get(r.loan_id) ?? 0) + Number(r.amount),
    );
  }

  const { data: friendsData, error: friendsError } = await supabase
    .from("user_friends")
    .select(
      "friend_id, nickname, friend:users!user_friends_friend_id_fkey(id, nickname, username, user_code)",
    )
    .eq("user_id", userId)
    .eq("status", "accepted");

  if (friendsError) throw friendsError;

  const nameMap = new Map<string, string>();
  for (const f of (friendsData ?? []) as any[]) {
    if (f.friend) {
      const name =
        f.nickname ||
        f.friend.nickname ||
        f.friend.username ||
        f.friend.user_code ||
        f.friend_id.slice(0, 8);
      nameMap.set(f.friend_id, name);
    }
  }

  const items: ActiveLoanItem[] = [];
  for (const row of loansData) {
    const loanAmount = Number(row.amount);
    const repaid = repaidByLoan.get(row.id) ?? 0;
    const remaining = loanAmount - repaid;
    if (remaining <= 0) continue;

    const isLender = row.lender_id === userId;
    const otherId = isLender ? row.borrower_id : row.lender_id;
    const personName = nameMap.get(otherId) ?? otherId.slice(0, 8);

    if (direction === "incoming" && !isLender) continue;
    if (direction === "outgoing" && isLender) continue;

    items.push({
      id: row.id,
      personId: otherId,
      personName,
      amount: loanAmount,
      remaining,
      currency: row.currency,
      dueDate: row.due_date,
      loanDate: row.loan_date,
      memo: row.memo ?? "",
      isIncoming: isLender,
    });
  }

  return items.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );
}

export async function createLoan(
  insert: Omit<
    Loan,
    "id" | "createdAt" | "status" | "approvedBy" | "approvedAt"
  >,
): Promise<Loan> {
  const approvalToken = insert.approvalToken || generateApprovalToken();

  const { data, error } = await supabase
    .from("loans")
    .insert({
      lender_id: insert.lenderId,
      borrower_id: insert.borrowerId,
      amount: insert.amount,
      currency: insert.currency,
      loan_date: insert.loanDate,
      due_date: insert.dueDate,
      memo: insert.memo,
      type: insert.type,
      approval_token: approvalToken,
      created_by: insert.createdBy,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLoan(data);
}

export async function updateLoanStatus(
  id: string,
  status: LoanStatus,
  approvedBy?: string,
): Promise<Loan> {
  const update: Record<string, unknown> = { status };
  if (approvedBy) {
    update.approved_by = approvedBy;
    update.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("loans")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapLoan(data);
}

/** Update borrower_id (for shadow user merge) */
export async function updateLoanBorrower(
  loanId: string,
  newBorrowerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("loans")
    .update({ borrower_id: newBorrowerId })
    .eq("id", loanId);

  if (error) throw error;
}

/** Replace shadow user with real user in all loans (lender_id, borrower_id, created_by, approved_by) */
export async function replaceShadowInLoans(
  shadowId: string,
  realUserId: string,
): Promise<void> {
  const { error: e1 } = await supabase
    .from("loans")
    .update({ lender_id: realUserId })
    .eq("lender_id", shadowId);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("loans")
    .update({ borrower_id: realUserId })
    .eq("borrower_id", shadowId);
  if (e2) throw e2;

  const { error: e3 } = await supabase
    .from("loans")
    .update({ created_by: realUserId })
    .eq("created_by", shadowId);
  if (e3) throw e3;

  const { error: e4 } = await supabase
    .from("loans")
    .update({ approved_by: realUserId })
    .eq("approved_by", shadowId);
  if (e4) throw e4;
}

export async function getLoanById(id: string): Promise<Loan | null> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapLoan(data);
}

export async function getLoanByApprovalToken(
  token: string,
): Promise<Loan | null> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapLoan(data);
}
