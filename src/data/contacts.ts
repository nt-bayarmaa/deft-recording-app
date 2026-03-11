import { supabase } from "@/integrations/supabase/client";
import type { Contact } from "@/types";

function mapContact(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    linkedUserId: row.linked_user_id,
    ownerUserId: row.owner_user_id,
  };
}

export async function getContacts(ownerUserId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, nickname, linked_user_id, owner_user_id")
    .eq("owner_user_id", ownerUserId)
    .order("name");

  if (error) throw error;
  return data.map(mapContact);
}

export async function createContact(
  ownerUserId: string,
  name: string,
  linkedUserId?: string
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      owner_user_id: ownerUserId,
      name,
      linked_user_id: linkedUserId ?? null,
    })
    .select("id, name, nickname, linked_user_id, owner_user_id")
    .single();

  if (error) throw error;
  return mapContact(data);
}

export async function updateContact(
  id: string,
  updates: Partial<Pick<Contact, "name" | "nickname" | "linkedUserId">>
): Promise<Contact> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
  if (updates.linkedUserId !== undefined) dbUpdates.linked_user_id = updates.linkedUserId;

  const { data, error } = await supabase
    .from("contacts")
    .update(dbUpdates)
    .eq("id", id)
    .select("id, name, nickname, linked_user_id, owner_user_id")
    .single();

  if (error) throw error;
  return mapContact(data);
}
