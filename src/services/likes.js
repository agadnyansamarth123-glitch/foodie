import supabase from "./supabase";

/**
 * Likes a post for the current user.
 * Returns { success: boolean, error: string | null }
 */
export async function likePost(postId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("likes")
    .insert({ user_id: user.id, post_id: postId });

  if (error) {
    // If unique violation, user already liked
    if (error.code === "23505") {
      return { success: false, error: "Already liked" };
    }
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Unlikes a post for the current user.
 * Returns { success: boolean, error: string | null }
 */
export async function unlikePost(postId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Checks if the current user has liked a post.
 * Returns { liked: boolean, error: string | null }
 */
export async function hasUserLikedPost(postId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { liked: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (error) {
    return { liked: false, error: error.message };
  }

  return { liked: !!data, error: null };
}

/**
 * Gets the like count for a post.
 * Returns { count: number, error: string | null }
 */
export async function getLikesCount(postId) {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count ?? 0, error: null };
}

/**
 * Toggles like for a post (like if not liked, unlike if liked).
 * Returns { liked: boolean, error: string | null }
 */
export async function toggleLike(postId) {
  const { liked, error } = await hasUserLikedPost(postId);

  if (error) {
    return { liked: false, error };
  }

  if (liked) {
    const result = await unlikePost(postId);
    return { liked: !result.success, error: result.error };
  } else {
    const result = await likePost(postId);
    return { liked: result.success, error: result.error };
  }
}