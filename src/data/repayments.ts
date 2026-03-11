import { supabase } from "@/integrations/supabase/client";
import type { Repayment } from "@/types";

function mapRepayment(row: any): Repayment {
  return {
    id: row.id,
    loanId: row.loan_id,
    amount: row.amount,
    currency: row.currency,
    repaymentDate: row.repayment_date,
    memo: row.memo ?? "",
    type: row.type,
    status: row.status,
    createdByUserId: row.created_by_user_id,
    personName: row.person_name,
    createdAt: row.created_at,
  };
}

export async function getRepayments(): Promise<Repayment[]> {
  const { data, error } = await supabase
    .from("repayments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapRepayment);
}

export async function createRepayment(
  insert: Omit<Repayment, "id" | "createdAt" | "status">
): Promise<Repayment> {
  const { data, error } = await supabase
    .from("repayments")
    .insert({
      loan_id: insert.loanId,
      amount: insert.amount,
      currency: insert.currency,
      repayment_date: insert.repaymentDate,
      memo: insert.memo,
      type: insert.type,
      created_by_user_id: insert.createdByUserId,
      person_name: insert.personName,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRepayment(data);
}
