import { supabase } from "@/integrations/supabase/client";
import type { Notification, NotificationType } from "@/types";

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    relatedLoanId: row.related_loan_id,
    relatedRepaymentId: row.related_repayment_id,
    approvalToken: row.approval_token ?? null,
    read: row.read ?? false,
    message: row.message,
    amount: row.amount,
    currency: row.currency,
    personName: row.person_name,
    createdAt: row.created_at,
  };
}

export async function createNotification(insert: {
  userId: string;
  type: NotificationType;
  relatedLoanId?: string | null;
  relatedRepaymentId?: string | null;
  approvalToken?: string | null;
  message: string;
  amount: number;
  currency: string;
  personName: string;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: insert.userId,
    type: insert.type,
    related_loan_id: insert.relatedLoanId ?? null,
    related_repayment_id: insert.relatedRepaymentId ?? null,
    approval_token: insert.approvalToken ?? null,
    message: insert.message,
    amount: insert.amount,
    currency: insert.currency,
    person_name: insert.personName,
  });
  if (error) throw error;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapNotification);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw error;
}
