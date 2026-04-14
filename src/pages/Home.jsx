import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import Navbar from "../components/Navbar";
import StoryBar from "../components/StoryBar";
import PostCard from "../components/PostCard";
import FloatingButton from "../components/FloatingButton";

function Home() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
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

      setIsCheckingSession(false);
    }

    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (isCheckingSession) {
      return;
    }

    let cancelled = false;

    async function loadPosts() {
      setIsLoadingPosts(true);
      setPostsError("");

      const { data, error } = await supabase
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

      setPosts(data ?? []);
      setIsLoadingPosts(false);
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [isCheckingSession]);

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
                username={post.username || "Unknown"}
                text={post.content}
                imageUrl={post.image_url}
                avatarUrl={post.avatar_url}
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
