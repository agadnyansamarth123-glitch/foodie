import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFollowingUsers } from "../services/follows";

function StoryBar() {
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      const { data } = await getFollowingUsers();
      if (data) setFollowing(data);
      setIsLoading(false);
    }
    fetchStories();
  }, []);

  return (
    <div className="border-b border-slate-100 bg-white/80">
      <div className="mx-auto max-w-2xl px-3 py-3 sm:px-4 lg:max-w-3xl">
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => navigate("/create-post")}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 p-[3px] shadow-md ring-2 ring-white">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-light text-brand-600">
                +
              </span>
            </span>
            <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-slate-700">
              Your Profile
            </span>
          </button>

          {!isLoading && following.length === 0 ? (
            <div className="flex h-[68px] items-center px-4">
              <span className="text-xs text-slate-500">Follow users to see their stories</span>
            </div>
          ) : (
            following.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 p-[2px] shadow-sm ring-2 ring-white overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-lg font-bold text-slate-700">
                      {user.username?.slice(0, 1).toUpperCase() || "?"}
                    </span>
                  )}
                </span>
                <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-slate-600">
                  {user.username}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryBar;
