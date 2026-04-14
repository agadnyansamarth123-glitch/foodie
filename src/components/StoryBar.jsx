import { useNavigate } from "react-router-dom";

const OTHER_USERS = [
  { id: "1", label: "Alex", color: "from-emerald-400 to-teal-500" },
  { id: "2", label: "Sam", color: "from-sky-400 to-blue-500" },
  { id: "3", label: "Jordan", color: "from-amber-400 to-orange-500" },
  { id: "4", label: "Riley", color: "from-lime-500 to-green-600" },
  { id: "5", label: "Casey", color: "from-slate-400 to-slate-600" },
];

function StoryBar() {
  const navigate = useNavigate();

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

          {OTHER_USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => navigate(`/profile/${user.id}`)}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br ${user.color} p-[2px] shadow-sm ring-2 ring-white`}
              >
                <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
                  {user.label.slice(0, 1)}
                </span>
              </span>
              <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-slate-600">
                {user.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoryBar;
