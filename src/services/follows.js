import supabase from "./supabase";

export async function followUser(followingId) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .insert({
      follower_id: authData.user.id,
      following_id: followingId,
    });

  if (error) {
    console.error("Error following user:", error);
    return { success: false, error };
  }
  return { success: true };
}

export async function unfollowUser(followingId) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .match({
      follower_id: authData.user.id,
      following_id: followingId,
    });

  if (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error };
  }
  return { success: true };
}

export async function getFollowState(followerId, followingId) {
  if (!followerId || !followingId) return false;

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .match({
      follower_id: followerId,
      following_id: followingId,
    })
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error getting follow state:", error);
  }

  return !!data;
}

export async function getFollowCounts(userId) {
  if (!userId) return { followers: 0, following: 0 };

  // Get followers count
  const { count: followersCount, error: err1 } = await supabase
    .from("follows")
    .select("*", { count: 'exact', head: true })
    .eq("following_id", userId);

  // Get following count
  const { count: followingCount, error: err2 } = await supabase
    .from("follows")
    .select("*", { count: 'exact', head: true })
    .eq("follower_id", userId);

  if (err1) console.error("Error getting followers:", err1);
  if (err2) console.error("Error getting following:", err2);

  return {
    followers: followersCount || 0,
    following: followingCount || 0,
  };
}

export async function getFollowingUsers() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { data: [], error: "Not authenticated" };

  const { data: follows, error: followsError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", authData.user.id);
    
  if (followsError || !follows || follows.length === 0) return { data: [] };

  const followingIds = follows.map(f => f.following_id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", followingIds);
    
  if (profilesError) return { data: [], error: profilesError };
  
  return { data: profiles };
}
