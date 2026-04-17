import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import { toggleLike } from "../services/likes";
import Navbar from "../components/Navbar";
import StoryBar from "../components/StoryBar";
import PostCard from "../components/PostCard";
import FloatingButton from "../components/FloatingButton";

function Home() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

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

  const handleLikeToggle = async (postId) => {
    if (!currentUserId) return;

    // Optimistically update the UI
    setPosts((prevPosts) =>
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
      setPosts((prevPosts) =>
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

  const handleDelete = async (postId) => {
    const confirmed = confirm("Delete this post?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) {
        alert("Failed to delete post. Please try again.");
        console.error("Error deleting post:", error);
        return;
      }

      // Remove post from UI
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      alert("Failed to delete post. Please try again.");
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    if (isCheckingSession) {
      return;
    }

    let cancelled = false;

    async function loadPosts() {
      setIsLoadingPosts(true);
      setPostsError("");

      const { data: postsData, error } = await supabase
        .from("posts_with_profiles")
        .select("id, user_id, content, image_url, created_at, username, avatar_url")
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        setPostsError(error.message || "Could not load posts.");
        setPosts([]);
        setIsLoadingPosts(false);
        return;
      }

      const posts = postsData ?? [];

      if (posts.length === 0) {
        setPosts([]);
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
        setPosts(posts.map((post) => ({ ...post, likeCount: 0, isLiked: false })));
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

      setPosts(postsWithLikes);
      setIsLoadingPosts(false);
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [isCheckingSession, currentUserId]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600">Loading home...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Navbar />
      <StoryBar />

      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 lg:max-w-3xl">
        <h1 className="sr-only">FoodGuard feed</h1>
        {isLoadingPosts ? (
          <p className="py-10 text-center text-sm text-slate-600">Loading posts...</p>
        ) : postsError ? (
          <p className="py-10 text-center text-sm text-red-600">{postsError}</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600">
              No posts yet. Click the <span className="font-semibold">+</span> button to create your
              first post.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                userId={post.user_id}
                username={post.username || "Unknown"}
                text={post.content}
                imageUrl={post.image_url}
                avatarUrl={post.avatar_url}
                likeCount={post.likeCount}
                isLiked={post.isLiked}
                onLikeToggle={handleLikeToggle}
                onDelete={handleDelete}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </main>

      <FloatingButton />
    </div>
  );
}

export default Home;
