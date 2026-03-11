import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types";

function generateUserCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "U-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, username, user_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    userId: data.user_id,
    username: data.username,
    userCode: data.user_code,
  };
}

export async function createUserProfile(
  userId: string,
  username?: string
): Promise<UserProfile> {
  const userCode = generateUserCode();

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      user_id: userId,
      username: username ?? null,
      user_code: userCode,
    })
    .select("user_id, username, user_code")
    .single();

  if (error) throw error;

  return {
    userId: data.user_id,
    username: data.username,
    userCode: data.user_code,
  };
}

export async function ensureUserProfile(userId: string): Promise<UserProfile> {
  const existing = await getUserProfile(userId);
  if (existing) return existing;
  return createUserProfile(userId);
}
