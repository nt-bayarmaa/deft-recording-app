import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "@/types";

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    relatedLoanId: row.related_loan_id,
    relatedRepaymentId: row.related_repayment_id,
    read: row.read ?? false,
    message: row.message,
    amount: row.amount,
    currency: row.currency,
    personName: row.person_name,
    createdAt: row.created_at,
  };
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
