import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

function LandingNavbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(data.session));
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(Boolean(session));
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/landing", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-8">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-md">
        <Link to="/" className="text-xl font-bold text-brand-700">
          FoodGuard
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <a href="#about" className="transition hover:text-brand-600">
            About
          </a>
          <a href="#contact" className="transition hover:text-brand-600">
            Contact
          </a>
          {!isLoggedIn ? (
            <Link to="/auth/login" className="transition hover:text-brand-600">
              Login
            </Link>
          ) : null}
          <Link
            to="/home"
            className="rounded-full bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700"
          >
            Open Platform
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-brand-700 transition hover:bg-brand-100"
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default LandingNavbar;
