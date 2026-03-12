import { supabase } from "@/integrations/supabase/client";
import type { Loan, LoanStatus, LoanSelectItem } from "@/types";

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

export async function getLoansForPerson(userId: string, personId: string): Promise<LoanSelectItem[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("id, amount, loan_date, due_date, memo")
    .eq("status", "completed")
    .or(`and(lender_id.eq.${userId},borrower_id.eq.${personId}),and(lender_id.eq.${personId},borrower_id.eq.${userId})`)
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

export async function createLoan(
  insert: Omit<Loan, "id" | "createdAt" | "status" | "approvedBy" | "approvedAt">
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
  approvedBy?: string
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
export async function updateLoanBorrower(loanId: string, newBorrowerId: string): Promise<void> {
  const { error } = await supabase
    .from("loans")
    .update({ borrower_id: newBorrowerId })
    .eq("id", loanId);

  if (error) throw error;
}

export async function getLoanByApprovalToken(token: string): Promise<Loan | null> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapLoan(data);
}
