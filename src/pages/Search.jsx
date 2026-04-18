import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import supabase from "../services/supabase";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { toggleLike } from "../services/likes";
import { followUser, unfollowUser } from "../services/follows";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setUsers([]);
        setPosts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setCurrentUserId(authData.user.id);
      }

      // Search Profiles
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${query}%`);

      let fetchedUsers = usersData || [];

      if (fetchedUsers.length > 0 && authData?.user) {
         const { data: followsData } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", authData.user.id);
            
         const followingSet = new Set(followsData?.map(f => f.following_id) || []);
         
         fetchedUsers = fetchedUsers.map(user => ({
           ...user,
           isFollowing: followingSet.has(user.id)
         }));
      }

      setUsers(fetchedUsers);

      // Search Posts
      const { data: postsData } = await supabase
        .from("posts_with_profiles")
        .select("id, user_id, content, image_url, created_at, username, avatar_url")
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false });

      const fetchedPosts = postsData || [];

      if (fetchedPosts.length > 0 && authData?.user) {
         const postIds = fetchedPosts.map(p => p.id);
         const { data: likesData } = await supabase.from("likes").select("post_id, user_id").in("post_id", postIds);
         if (likesData) {
            const likesMap = {};
            likesData.forEach(like => {
              if (!likesMap[like.post_id]) {
                likesMap[like.post_id] = { count: 0, likers: new Set() };
              }
              likesMap[like.post_id].count++;
              likesMap[like.post_id].likers.add(like.user_id);
            });
            fetchedPosts.forEach(post => {
              const likeInfo = likesMap[post.id] || { count: 0, likers: new Set() };
              post.likeCount = likeInfo.count;
              post.isLiked = likeInfo.likers.has(authData.user.id);
            });
         }
      }

      setPosts(fetchedPosts);
      setIsLoading(false);
    }

    performSearch();
  }, [query]);

  const handleLikeToggle = async (postId) => {
    if (!currentUserId) return;
    
    setPosts(prev => prev.map(post => 
      post.id === postId ? {
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
      } : post
    ));

    const { error } = await toggleLike(postId);
    if (error) {
       setPosts(prev => prev.map(post => 
          post.id === postId ? {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          } : post
        ));
    }
  };

  const handleDeletePost = async (postId) => {
    // Delete already confirmed locally inside PostCard dropdown logic
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          Results for: <span className="text-brand-600">"{query}"</span>
        </h1>

        {isLoading ? (
          <p className="text-slate-500 text-center py-10">Searching...</p>
        ) : (
          <div className="space-y-8">
            {users.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Users</h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            user.username?.charAt(0).toUpperCase() || "?"
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{user.username}</span>
                      </Link>

                      {currentUserId && currentUserId !== user.id && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            if (user.isFollowing) {
                              setUsers(users.map(u => u.id === user.id ? { ...u, isFollowing: false } : u));
                              await unfollowUser(user.id);
                            } else {
                              setUsers(users.map(u => u.id === user.id ? { ...u, isFollowing: true } : u));
                              await followUser(user.id);
                            }
                          }}
                          className={`ml-4 rounded-full px-5 py-1.5 text-xs font-semibold transition ${
                            user.isFollowing 
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                              : "bg-brand-600 text-white hover:bg-brand-700"
                          }`}
                        >
                          {user.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {posts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Posts</h2>
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      postId={post.id}
                      username={post.username || "Unknown"}
                      text={post.content}
                      imageUrl={post.image_url}
                      avatarUrl={post.avatar_url}
                      likeCount={post.likeCount || 0}
                      isLiked={post.isLiked || false}
                      onLikeToggle={handleLikeToggle}
                      currentUserId={currentUserId}
                      userId={post.user_id}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              </section>
            )}

            {!isLoading && users.length === 0 && posts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-lg">No results found 😕</p>
                <p className="text-slate-400 text-sm mt-1">Try another search term.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Search;
