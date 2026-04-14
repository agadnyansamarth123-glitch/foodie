import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import { getCurrentUserProfile } from "../services/profiles";

function Navbar() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const { profile: row } = await getCurrentUserProfile();
      if (!cancelled) {
        setProfile(row);
      }
    }

    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const displayLetter =
    profile?.username?.trim()?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/landing")}
          className="shrink-0 text-lg font-bold text-brand-700 transition hover:text-brand-600"
        >
          FoodGuard
        </button>

        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search food, users, tags..."
            aria-label="Search (preview only)"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate("/scanner")}
            className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-brand-600 hover:to-brand-700 sm:text-sm"
          >
            Scanner
          </button>
          <button
            type="button"
            onClick={() => navigate("/suggestions")}
            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-100 sm:text-sm"
          >
            Suggest
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label="Your profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand-200 bg-gradient-to-br from-brand-100 to-white text-sm font-bold text-brand-700 shadow-sm transition hover:border-brand-400"
          >
            <span className="sr-only">Profile</span>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username ? `${profile.username} avatar` : "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden>{displayLetter}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
