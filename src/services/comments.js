import supabase from "./supabase";

/**
 * Adds a comment to a post for the current user.
 * Returns { success: boolean, error: string | null }
 */
export async function addComment(postId, content) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, post_id: postId, content });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Deletes a comment for the current user.
 * Returns { success: boolean, error: string | null }
 */
export async function deleteComment(commentId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Gets comments for a post, joined with profiles for usernames.
 * Returns { comments: array, error: string | null }
 */
export async function getCommentsForPost(postId) {
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      user_id
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Database error fetching comments:", commentsError);
    return { comments: [], error: commentsError.message };
  }

  const comments = commentsData ?? [];
  const userIds = [...new Set(comments.map((comment) => comment.user_id).filter(Boolean))];

  let profilesMap = {};
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Database error fetching profiles for comments:", profilesError);
      profilesMap = {};
    } else {
      profilesMap = (profilesData ?? []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  const normalizedComments = comments.map((comment) => {
    const profile = profilesMap[comment.user_id];
    return {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user_id,
      username: profile?.username || "Unknown",
      avatar_url: profile?.avatar_url,
    };
  });

  return { comments: normalizedComments, error: null };
}