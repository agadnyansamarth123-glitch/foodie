import supabase from "./supabase";

/**
 * Returns the profile row for the currently logged-in user, or null if missing / not signed in.
 */
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: userError ?? null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return { profile: data ?? null, error };
}

/**
 * Loads a profile by user id (works for any user; RLS allows read for all).
 */
export async function getProfileByUserId(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, created_at")
    .eq("id", userId)
    .maybeSingle();

  return { profile: data ?? null, error };
}
