import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supabase from "../services/supabase";
import { getCurrentUserProfile, getProfileByUserId } from "../services/profiles";
import { toggleLike } from "../services/likes";
import PostCard from "../components/PostCard";
import { followUser, unfollowUser, getFollowState, getFollowCounts } from "../services/follows";


const MOCK_NAMES = {
  "1": "Alex",
  "2": "Sam",
  "3": "Jordan",
  "4": "Riley",
  "5": "Casey",
};

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value ?? ""
  );
}

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [editBio, setEditBio] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) setEditBio(profile.bio || "");
  }, [profile]);

  const isOtherUser = Boolean(id);
  const isUuidParam = isOtherUser && isUuid(id);
  const isDemoStoryId = isOtherUser && !isUuidParam;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Log the file for debug visibility
    console.log("Attempting to upload file:", file.name, file.type, file.size);

    setIsUploadingAvatar(true);
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `${currentUserId}-${timestamp}.${fileExt}`;

    try {
      // 1. Verify Authentication
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error("User not authenticated for upload");
      }

      // 2. Execute Upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
           upsert: true
        });

      if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload Success Data:", uploadData);

      // 3. Fetch public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatar_url = publicUrlData.publicUrl;
      console.log("Generated Final URL:", avatar_url);

      // 4. Map back to database
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url })
        .eq("id", currentUserId);

      if (dbError) {
        console.error("Profile Database Update Error:", dbError);
        throw dbError;
      }
        
      setProfile((prev) => ({ ...prev, avatar_url }));
    } catch (error) {
      console.error("Full Upload Crash Trace:", error);
      alert("Error uploading avatar. Check console logs for details.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: editBio })
        .eq("id", currentUserId);

      if (error) throw error;
      
      setProfile((prev) => ({ ...prev, bio: editBio }));
    } catch (error) {
      console.error(error);
      alert("Error saving bio");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;
    
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setMyPosts(prev => prev.filter(p => p.id !== postId));
      setSelectedPost(null);
    } else {
      console.error(error);
      alert("Failed to delete post.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure? This will delete your data");
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      await supabase.from("comments").delete().eq("user_id", currentUserId);
      await supabase.from("posts").delete().eq("user_id", currentUserId);
      await supabase.from("profiles").delete().eq("id", currentUserId);
      
      await supabase.auth.signOut();
      navigate("/auth/login");
    } catch (e) {
      console.error(e);
      alert("Error deleting account");
      setIsDeletingAccount(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
    if (isFollowing) {
      await unfollowUser(profile.id);
      setIsFollowing(false);
      setFollowersCount(c => c - 1);
    } else {
      await followUser(profile.id);
      setIsFollowing(true);
      setFollowersCount(c => c + 1);
    }
    setIsFollowLoading(false);
  };

  const handleLikeToggle = async (postId) => {
    if (!currentUserId) return;

    // Optimistically update the UI
    setMyPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );

    // Call the API
    const { liked, error } = await toggleLike(postId);

    if (error) {
      // Revert on error
      setMyPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
      console.error("Error toggling like:", error);
    }
  };

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login", { replace: true });
        return;
      }
      setCurrentUserId(data.session.user.id);
      setIsCheckingSession(false);
    }
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (isCheckingSession) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoadingProfile(true);
      setLoadError(null);

      if (isDemoStoryId) {
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      if (!isOtherUser) {
        const { profile: row, error } = await getCurrentUserProfile();
        if (cancelled) {
          return;
        }
        if (error) {
          setLoadError(error.message);
          setProfile(null);
        } else {
          setProfile(row);
          if (row) {
            const counts = await getFollowCounts(row.id);
            setFollowersCount(counts.followers);
            setFollowingCount(counts.following);
          }
        }
        setIsLoadingProfile(false);
        return;
      }

      const { profile: row, error } = await getProfileByUserId(id);
      if (cancelled) {
        return;
      }
      if (error) {
        setLoadError(error.message);
        setProfile(null);
      } else {
        setProfile(row);
        if (row) {
          const counts = await getFollowCounts(row.id);
          setFollowersCount(counts.followers);
          setFollowingCount(counts.following);

          // Check if current user is following this profile
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const following = await getFollowState(authData.user.id, row.id);
            setIsFollowing(following);
          }
        }
      }
      setIsLoadingProfile(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isCheckingSession, isOtherUser, isDemoStoryId, id]);

  useEffect(() => {
    if (isCheckingSession) {
      return;
    }

    let cancelled = false;

    async function loadMyPosts() {
      setIsLoadingPosts(true);
      setPostsError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (userError || !user) {
        setMyPosts([]);
        setIsLoadingPosts(false);
        setPostsError("Could not load your user.");
        return;
      }

      const targetUserId = isOtherUser ? id : user.id;

      const { data: postsData, error } = await supabase
        .from("posts_with_profiles")
        .select("id, user_id, content, image_url, created_at, username, avatar_url")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        setMyPosts([]);
        setIsLoadingPosts(false);
        setPostsError(error.message || "Could not load your posts.");
        return;
      }

      const posts = postsData ?? [];

      if (posts.length === 0) {
        setMyPosts([]);
        setIsLoadingPosts(false);
        return;
      }

      // Fetch likes for these posts
      const postIds = posts.map((p) => p.id);
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

      if (likesError) {
        console.error("Error loading likes:", likesError);
        // Continue without likes
        setMyPosts(posts.map((post) => ({ ...post, likeCount: 0, isLiked: false })));
        setIsLoadingPosts(false);
        return;
      }

      // Process likes
      const likesMap = {};
      likesData.forEach((like) => {
        if (!likesMap[like.post_id]) {
          likesMap[like.post_id] = { count: 0, likers: new Set() };
        }
        likesMap[like.post_id].count++;
        likesMap[like.post_id].likers.add(like.user_id);
      });

      // Add likes to posts
      const postsWithLikes = posts.map((post) => {
        const likeInfo = likesMap[post.id] || { count: 0, likers: new Set() };
        return {
          ...post,
          likeCount: likeInfo.count,
          isLiked: likeInfo.likers.has(currentUserId),
        };
      });

      setMyPosts(postsWithLikes);
      setIsLoadingPosts(false);
    }

    loadMyPosts();

    return () => {
      cancelled = true;
    };
  }, [isCheckingSession, isOtherUser, currentUserId]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600">Loading profile...</p>
      </main>
    );
  }

  const demoName = isDemoStoryId ? MOCK_NAMES[id] ?? `User ${id}` : null;
  const heading = isDemoStoryId
    ? `${demoName}'s profile`
    : profile?.username ?? "Your profile";
  const avatarLetter = (
    profile?.username?.trim()?.charAt(0) ??
    demoName?.charAt(0) ??
    "?"
  ).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {!isOtherUser && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition"
          >
            ⚙️ Settings
          </button>
        )}
        {isLoadingProfile ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : isDemoStoryId ? (
          <>
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-brand-100 bg-gradient-to-br from-brand-100 to-brand-200 text-4xl font-bold text-brand-800">
              {avatarLetter}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">{heading}</h1>
            <p className="mt-3 text-sm text-slate-600">
              Demo story user. Connect real UUIDs in StoryBar to load Supabase profiles.
            </p>
          </>
        ) : isOtherUser && isUuidParam && !profile ? (
          <p className="text-sm text-slate-600">This user does not have a profile yet.</p>
        ) : !profile && !isOtherUser ? (
          <p className="text-sm text-slate-600">
            No profile found for your account. Run the Supabase SQL in the dashboard, then sign
            up again or add a row for your user id in the{" "}
            <span className="font-medium">profiles</span> table.
          </p>
        ) : profile ? (
          <>
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-brand-100 bg-gradient-to-br from-brand-100 to-brand-200 text-4xl font-bold text-brand-800">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">{profile.username}</h1>

            <div className="mt-3 flex justify-center gap-6 text-sm">
               <div className="flex flex-col items-center">
                 <span className="font-bold text-slate-900">{followersCount}</span>
                 <span className="text-slate-500">Followers</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="font-bold text-slate-900">{followingCount}</span>
                 <span className="text-slate-500">Following</span>
               </div>
            </div>

            {isOtherUser && currentUserId && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`rounded-full px-8 py-2 text-sm font-semibold transition ${
                    isFollowing 
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  } disabled:opacity-50`}
                >
                  {isFollowLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}
            {profile.bio?.trim() ? (
              <p className="mt-4 text-left text-sm leading-relaxed text-slate-600">
                {profile.bio.trim()}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-slate-500">No bio yet.</p>
            )}
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/home"
            className="inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Back to feed
          </Link>
          <Link
            to="/landing"
            className="inline-block rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Landing
          </Link>
        </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-left text-base font-semibold text-slate-900">
                {!isOtherUser ? "Your posts" : `${profile?.username || 'User'}'s posts`}
              </h2>
              <p className="mt-1 text-left text-sm text-slate-600">
                {!isOtherUser ? "Posts you created from FoodGuard." : "Recent posts from this user."}
              </p>
            </div>
              <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                Posts: {isLoadingPosts ? "..." : myPosts.length}
              </div>
            </div>

            {isLoadingPosts ? (
              <p className="mt-6 text-center text-sm text-slate-600">
                Loading your posts...
              </p>
            ) : postsError ? (
              <p className="mt-6 text-center text-sm text-red-600">{postsError}</p>
            ) : myPosts.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                You haven&apos;t posted anything yet. Create your first post from the{" "}
                <span className="font-medium">+</span> button on the home feed.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {myPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="group relative h-56 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full p-5">
                        <p className="line-clamp-2 break-words text-sm text-slate-700 w-full">
                          {post.content || "No content"}
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 hidden items-center justify-center bg-black/40 transition-all duration-300 group-hover:flex">
                      <span className="font-semibold text-white">View Post</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
      </div>

      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-10 right-0 text-xl font-bold text-white hover:text-slate-300 transition-colors"
              onClick={() => setSelectedPost(null)}
            >
              ✕
            </button>
            <div className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl hide-scrollbar">
              <PostCard
                postId={selectedPost.id}
                username={selectedPost.username || profile?.username || "You"}
                text={selectedPost.content}
                imageUrl={selectedPost.image_url}
                avatarUrl={selectedPost.avatar_url || profile?.avatar_url || null}
                likeCount={selectedPost.likeCount}
                isLiked={selectedPost.isLiked}
                onLikeToggle={handleLikeToggle}
                currentUserId={currentUserId}
                userId={selectedPost.user_id}
                onDelete={handleDeletePost}
              />
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSettingsModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              
              {!isOtherUser && (
                <>
                  <div className="flex flex-col items-center border-b border-slate-100 pb-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 mb-3 border-2 border-brand-100">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-700">
                          {profile?.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700">
                      {isUploadingAvatar ? "Uploading..." : "Change Profile Photo"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Edit Bio</label>
                    <textarea
                      className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none min-h-[80px]"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Write a short bio..."
                    />
                    <button
                      onClick={handleSaveBio}
                      disabled={isSavingProfile || isUploadingAvatar}
                      className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isSavingProfile ? "Saving..." : "Save Bio"}
                    </button>
                  </div>
                  
                  <div className="pt-2"></div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
