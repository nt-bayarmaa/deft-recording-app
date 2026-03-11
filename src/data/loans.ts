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
    senderBank: row.sender_bank,
    senderAccount: row.sender_account,
    recipientBank: row.recipient_bank,
    recipientAccount: row.recipient_account,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    createdAt: row.created_at,
  };
}

export async function getLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapLoan);
}

export async function getLoansForPerson(personId: string): Promise<LoanSelectItem[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("id, borrower_id, lender_id, amount, loan_date, due_date, memo")
    .eq("status", "approved")
    .or(`borrower_id.eq.${personId},lender_id.eq.${personId}`)
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
  insert: Omit<Loan, "id" | "createdAt" | "status" | "approvedBy">
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
      sender_bank: insert.senderBank,
      sender_account: insert.senderAccount,
      recipient_bank: insert.recipientBank,
      recipient_account: insert.recipientAccount,
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
