import { supabase } from "@/integrations/supabase/client";
import type { AppUser, Friend } from "@/types";

function mapUser(row: any): AppUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    username: row.username,
    nickname: row.nickname,
    userCode: row.user_code,
    email: row.email ?? null,
    createdAt: row.created_at,
  };
}

/** Get the app user row for the current auth user */
export async function getAppUser(authUserId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUser(data);
}

/** Get or create app user - creates row if not found (e.g. new signup, no DB trigger) */
export async function getOrCreateAppUser(
  authUserId: string,
  email?: string | null,
  /** OAuth-аар анх нэвтрэх үед нэр (user_metadata.full_name эсвэл email prefix) */
  displayName?: string | null,
): Promise<AppUser> {
  const existing = await getAppUser(authUserId);
  if (existing) {
    if (email != null && existing.email !== email) {
      await supabase
        .from("users")
        .update({ email, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return { ...existing, email };
    }
    return existing;
  }

  const userCode = generateUserCode();
  const initialUsername =
    displayName || (email ? email.split("@")[0] : null) || null;

  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_user_id: authUserId,
      user_code: userCode,
      nickname: null,
      username: initialUsername,
      email: email ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapUser(data);
}

/** Get user by id */
export async function getUserById(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUser(data);
}

/** Search user by user_code */
export async function getUserByCode(userCode: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_code", userCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUser(data);
}

/** Create a shadow user (no auth_user_id). Uses username for lender's label. */
export async function createShadowUser(label: string): Promise<AppUser> {
  const userCode = generateUserCode();
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: label,
      user_code: userCode,
      auth_user_id: null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapUser(data);
}

function generateUserCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "U-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Friends ---

export async function getFriends(
  userId: string,
): Promise<(Friend & { friend: AppUser })[]> {
  const { data, error } = await supabase
    .from("user_friends")
    .select(
      "id, user_id, friend_id, status, nickname, friend:users!user_friends_friend_id_fkey(*)",
    )
    .eq("user_id", userId)
    .eq("status", "accepted");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    friendId: row.friend_id,
    status: row.status,
    nickname: row.nickname ?? null,
    friend: mapUser(row.friend),
  }));
}

export async function addFriend(
  userId: string,
  friendId: string,
  nickname?: string | null,
): Promise<void> {
  const { data: existing } = await supabase
    .from("user_friends")
    .select("id")
    .eq("user_id", userId)
    .eq("friend_id", friendId)
    .maybeSingle();

  if (existing) return;

  const insert =
    nickname != null
      ? { user_id: userId, friend_id: friendId, status: "accepted", nickname }
      : { user_id: userId, friend_id: friendId, status: "accepted" };

  const { error } = await supabase.from("user_friends").insert(insert);

  if (error) throw error;
}

/** Display name for a friend: friendship nickname || friend's own name */
export function getFriendDisplayName(
  friendshipNickname: string | null | undefined,
  friend: AppUser,
): string {
  return (
    friendshipNickname ||
    friend.nickname ||
    friend.username ||
    friend.userCode ||
    friend.id.slice(0, 8)
  );
}

/** Remove friend links pointing to shadow (before merge); addFriend will add real user */
export async function removeFriendLinksToShadow(
  shadowId: string,
): Promise<void> {
  const { error: e1 } = await supabase
    .from("user_friends")
    .delete()
    .eq("user_id", shadowId);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("user_friends")
    .delete()
    .eq("friend_id", shadowId);
  if (e2) throw e2;
}

/** Delete shadow user (used during merge) */
export async function deleteShadowUser(shadowId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", shadowId)
    .is("auth_user_id", null);

  if (error) throw error;
}
