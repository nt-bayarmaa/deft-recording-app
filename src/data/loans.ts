import { supabase } from "@/integrations/supabase/client";
import type { Loan, LoanStatus, LoanSelectItem } from "@/types";

function mapLoan(row: any): Loan {
  return {
    id: row.id,
    lenderId: row.lender_id,
    borrowerId: row.borrower_id,
    borrowerName: row.borrower_name,
    lenderName: row.lender_name,
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
    userId: row.borrower_id === personId ? Number(row.borrower_id) : Number(row.lender_id),
    amount: row.amount,
    loanDate: row.loan_date,
    dueDate: row.due_date,
    memo: row.memo ?? "",
  }));
}

export async function createLoan(
  insert: Omit<Loan, "id" | "createdAt" | "status">
): Promise<Loan> {
  const { data, error } = await supabase
    .from("loans")
    .insert({
      lender_id: insert.lenderId,
      borrower_id: insert.borrowerId,
      borrower_name: insert.borrowerName,
      lender_name: insert.lenderName,
      amount: insert.amount,
      currency: insert.currency,
      loan_date: insert.loanDate,
      due_date: insert.dueDate,
      memo: insert.memo,
      type: insert.type,
      approval_token: insert.approvalToken,
      sender_bank: insert.senderBank,
      sender_account: insert.senderAccount,
      recipient_bank: insert.recipientBank,
      recipient_account: insert.recipientAccount,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLoan(data);
}

export async function updateLoanStatus(
  id: string,
  status: LoanStatus
): Promise<Loan> {
  const { data, error } = await supabase
    .from("loans")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapLoan(data);
}
