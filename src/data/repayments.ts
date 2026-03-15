import { supabase } from "@/integrations/supabase/client";
import type { Repayment } from "@/types";

function generateApprovalToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

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
    approvalToken: row.approval_token ?? null,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    personName: row.person_name ?? "",
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
  insert: Omit<Repayment, "id" | "createdAt" | "status" | "approvedBy" | "approvalToken">
): Promise<Repayment> {
  const isPay = insert.type === "pay";
  const status = isPay ? "pending_lender_approval" : "completed";
  const approvalToken = isPay ? generateApprovalToken() : null;

  const { data, error } = await supabase
    .from("repayments")
    .insert({
      loan_id: insert.loanId,
      amount: insert.amount,
      currency: insert.currency,
      repayment_date: insert.repaymentDate,
      memo: insert.memo,
      type: insert.type,
      status,
      approval_token: approvalToken,
      created_by: insert.createdBy,
      person_name: insert.personName,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRepayment(data);
}

export async function updateRepaymentStatus(
  id: string,
  status: "completed" | "rejected",
  approvedBy: string
): Promise<Repayment> {
  const { data, error } = await supabase
    .from("repayments")
    .update({
      status,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRepayment(data);
}

export async function getRepaymentByApprovalToken(token: string): Promise<Repayment | null> {
  const { data, error } = await supabase
    .from("repayments")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRepayment(data);
}
