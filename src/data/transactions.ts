import { supabase } from "@/integrations/supabase/client";
import type { Transaction } from "@/types";

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    loanId: row.loan_id,
    repaymentId: row.repayment_id,
    transactionDate: row.transaction_date,
    senderBank: row.sender_bank,
    senderAccount: row.sender_account,
    recipientBank: row.recipient_bank,
    recipientAccount: row.recipient_account,
    memo: row.memo,
    createdAt: row.created_at,
  };
}

export async function createTransaction(
  insert: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: insert.type,
      loan_id: insert.loanId,
      repayment_id: insert.repaymentId,
      transaction_date: insert.transactionDate,
      sender_bank: insert.senderBank,
      sender_account: insert.senderAccount,
      recipient_bank: insert.recipientBank,
      recipient_account: insert.recipientAccount,
      memo: insert.memo,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapTransaction(data);
}
