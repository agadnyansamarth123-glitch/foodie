import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supabase from "../services/supabase";
import { getCurrentUserProfile, getProfileByUserId } from "../services/profiles";
import { toggleLike } from "../services/likes";
import PostCard from "../components/PostCard";

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

  const isOtherUser = Boolean(id);
  const isUuidParam = isOtherUser && isUuid(id);
  const isDemoStoryId = isOtherUser && !isUuidParam;

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
      }
      setIsLoadingProfile(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isCheckingSession, isOtherUser, isDemoStoryId, id]);

  useEffect(() => {
    if (isCheckingSession || isOtherUser) {
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

      const { data: postsData, error } = await supabase
        .from("posts_with_profiles")
        .select("id, user_id, content, image_url, created_at, username, avatar_url")
        .eq("user_id", user.id)
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
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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

        {!isOtherUser ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Your posts</h2>
            <p className="mt-1 text-sm text-slate-600">
              Posts you created from FoodGuard.
            </p>

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
              <div className="mt-6 space-y-4">
                {myPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
                    username={post.username || profile?.username || "You"}
                    text={post.content}
                    imageUrl={post.image_url}
                    avatarUrl={post.avatar_url || profile?.avatar_url || null}
                    likeCount={post.likeCount}
                    isLiked={post.isLiked}
                    onLikeToggle={handleLikeToggle}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default Profile;
