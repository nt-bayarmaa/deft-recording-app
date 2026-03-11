import { supabase } from "@/integrations/supabase/client";
import type { Person } from "@/types";

export async function getPersons(): Promise<Person[]> {
  const { data, error } = await supabase
    .from("persons")
    .select("id, name, linked_user_id")
    .order("name");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    linkedUserId: row.linked_user_id,
  }));
}

export async function createPerson(name: string): Promise<Person> {
  const { data, error } = await supabase
    .from("persons")
    .insert({ name })
    .select("id, name, linked_user_id")
    .single();

  if (error) throw error;

  return { id: data.id, name: data.name, linkedUserId: data.linked_user_id };
}

export async function updatePerson(
  id: number,
  updates: Partial<Pick<Person, "name" | "linkedUserId">>
): Promise<Person> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.linkedUserId !== undefined) dbUpdates.linked_user_id = updates.linkedUserId;

  const { data, error } = await supabase
    .from("persons")
    .update(dbUpdates)
    .eq("id", id)
    .select("id, name, linked_user_id")
    .single();

  if (error) throw error;

  return { id: data.id, name: data.name, linkedUserId: data.linked_user_id };
}
